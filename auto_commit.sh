#!/bin/bash

# ============================================
# Auto-Commit with Gemini AI
# ============================================
# Analyzes staged git changes and generates
# intelligent commit messages using Gemini API
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROMPT_FILE="$SCRIPT_DIR/auto_commit_prompt.md"
PLAN_FILE="$SCRIPT_DIR/auto_commit_plan.json"
GEMINI_MODEL="gemini-2.5-flash"
GEMINI_API_URL="https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent"

# Check for API key
if [ -z "$GEMINI_API_KEY" ]; then
    # Try to load from .env file
    if [ -f "$SCRIPT_DIR/.env" ]; then
        export $(grep GEMINI_API_KEY "$SCRIPT_DIR/.env" | xargs)
    fi
    
    if [ -z "$GEMINI_API_KEY" ]; then
        echo -e "${RED}Error: GEMINI_API_KEY is not set${NC}"
        echo "Please set it via: export GEMINI_API_KEY='your-key'"
        exit 1
    fi
fi

# Check for staged changes
STAGED_DIFF=$(git diff --cached)
if [ -z "$STAGED_DIFF" ]; then
    echo -e "${YELLOW}No staged changes found.${NC}"
    echo "Stage your changes first with: git add <files>"
    exit 0
fi

# Show what's staged
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📝 Analyzing staged changes...${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Show staged files
echo -e "\n${GREEN}Staged files:${NC}"
git diff --cached --name-status | while read status file; do
    case $status in
        A) echo -e "  ${GREEN}+ $file${NC}" ;;
        M) echo -e "  ${YELLOW}~ $file${NC}" ;;
        D) echo -e "  ${RED}- $file${NC}" ;;
        *) echo -e "  $status $file" ;;
    esac
done

# Read prompt template and inject diff
if [ ! -f "$PROMPT_FILE" ]; then
    echo -e "${RED}Error: Prompt file not found: $PROMPT_FILE${NC}"
    exit 1
fi

PROMPT_TEMPLATE=$(cat "$PROMPT_FILE")
FULL_PROMPT="${PROMPT_TEMPLATE//\{\{GIT_DIFF\}\}/$STAGED_DIFF}"

# Call Gemini API
echo -e "\n${BLUE}🤖 Calling Gemini API...${NC}"

# Create temp files to avoid ARG_MAX issues
TEMP_PROMPT=$(mktemp)
TEMP_JSON=$(mktemp)

# Write prompt to temp file
printf '%s' "$FULL_PROMPT" > "$TEMP_PROMPT"

# Create JSON template and inject prompt using --rawfile (reads from file, no ARG_MAX limit)
cat > "$TEMP_JSON" <<'EOF'
{
    "contents": [{
        "parts": [{"text": ""}]
    }],
    "generationConfig": {
        "temperature": 0.3,
        "maxOutputTokens": 8192
    }
}
EOF

jq --rawfile prompt "$TEMP_PROMPT" '.contents[0].parts[0].text = $prompt' "$TEMP_JSON" > "$TEMP_JSON.tmp"
mv "$TEMP_JSON.tmp" "$TEMP_JSON"

# Use the temp file as curl input
RESPONSE=$(curl -s "${GEMINI_API_URL}?key=${GEMINI_API_KEY}" \
    -H 'Content-Type: application/json' \
    --data "@$TEMP_JSON")

# Clean up
rm -f "$TEMP_PROMPT" "$TEMP_JSON" "$TEMP_JSON.tmp"

# Check for errors
if echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    echo -e "${RED}API Error:${NC}"
    echo "$RESPONSE" | jq '.error'
    exit 1
fi

# Extract the text response
AI_TEXT=$(echo "$RESPONSE" | jq -r '.candidates[0].content.parts[0].text // empty')

if [ -z "$AI_TEXT" ]; then
    echo -e "${RED}Error: Empty response from Gemini${NC}"
    echo "Raw response:"
    echo "$RESPONSE" | jq .
    exit 1
fi

# Extract JSON from response (handle markdown code blocks)
COMMIT_PLAN=$(echo "$AI_TEXT" | sed -n '/```json/,/```/p' | sed '1d;$d')
if [ -z "$COMMIT_PLAN" ]; then
    # Try without code blocks - use non-greedy match
    COMMIT_PLAN=$(echo "$AI_TEXT" | grep -oP '{[^{}]*(?:{[^{}]*}[^{}]*)*' | head -1)
    # If that didn't work, try a simpler approach
    if [ -z "$COMMIT_PLAN" ] || ! echo "$COMMIT_PLAN" | jq . > /dev/null 2>&1; then
        COMMIT_PLAN=$(echo "$AI_TEXT" | grep -o '{.*}' | head -1)
    fi
fi

if [ -z "$COMMIT_PLAN" ]; then
    echo -e "${YELLOW}Could not parse JSON from response. Raw output:${NC}"
    echo "$AI_TEXT"
    exit 1
fi

# Validate JSON
if ! echo "$COMMIT_PLAN" | jq . > /dev/null 2>&1; then
    echo -e "${RED}Invalid JSON in response${NC}"
    echo "$AI_TEXT"
    exit 1
fi

# Save plan for reference
echo "$COMMIT_PLAN" > "$PLAN_FILE"

# Display commit plan
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📋 Commit Plan:${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

COMMIT_COUNT=$(echo "$COMMIT_PLAN" | jq '.commits | length')

for i in $(seq 0 $((COMMIT_COUNT - 1))); do
    MESSAGE=$(echo "$COMMIT_PLAN" | jq -r ".commits[$i].message")
    DESCRIPTION=$(echo "$COMMIT_PLAN" | jq -r ".commits[$i].description // empty")
    FILES=$(echo "$COMMIT_PLAN" | jq -r ".commits[$i].files | join(\", \")")
    
    echo -e "\n${YELLOW}Commit $((i + 1)):${NC} $MESSAGE"
    if [ -n "$DESCRIPTION" ]; then
        echo -e "   ${BLUE}→${NC} $DESCRIPTION"
    fi
    echo -e "   ${CYAN}Files:${NC} $FILES"
done

echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Ask for confirmation
echo -e "\n${YELLOW}Proceed with these commits? [y/n/e(dit)]${NC}"
read -r CONFIRM

case $CONFIRM in
    y|Y|yes|Yes)
        echo -e "\n${GREEN}Creating commits...${NC}"
        
        if [ "$COMMIT_COUNT" -eq 1 ]; then
            # Single commit - just commit all staged changes
            MESSAGE=$(echo "$COMMIT_PLAN" | jq -r '.commits[0].message')
            git commit -m "$MESSAGE"
            echo -e "${GREEN}✓ Created commit: $MESSAGE${NC}"
        else
            # Multiple commits - unstage all, then restage per commit
            echo -e "${BLUE}Processing $COMMIT_COUNT commits...${NC}\n"

            # Unstage everything first
            git reset HEAD --quiet

            for i in $(seq 0 $((COMMIT_COUNT - 1))); do
                MESSAGE=$(echo "$COMMIT_PLAN" | jq -r ".commits[$i].message")
                FILES=$(echo "$COMMIT_PLAN" | jq -r ".commits[$i].files[]")

                echo -e "${CYAN}[$((i + 1))/$COMMIT_COUNT]${NC} Staging files for: $MESSAGE"

                # Stage files for this commit
                while IFS= read -r file; do
                    if [ -f "$file" ] || [ -d "$file" ]; then
                        git add "$file" 2>/dev/null || echo -e "  ${YELLOW}⚠ $file (not found, skipping)${NC}"
                    fi
                done <<< "$FILES"

                # Check if anything is staged
                if git diff --cached --quiet; then
                    echo -e "  ${YELLOW}⚠ No files staged, skipping${NC}\n"
                    continue
                fi

                # Create the commit
                git commit -m "$MESSAGE" --quiet
                echo -e "  ${GREEN}✓${NC} Committed\n"
            done
        fi
        
        echo -e "\n${GREEN}✅ Done!${NC}"
        ;;
    e|E|edit)
        echo -e "\n${BLUE}Opening plan for editing...${NC}"
        ${EDITOR:-vim} "$PLAN_FILE"
        echo -e "${YELLOW}Edit complete. Run the script again to commit.${NC}"
        ;;
    *)
        echo -e "\n${YELLOW}Aborted.${NC}"
        exit 0
        ;;
esac
