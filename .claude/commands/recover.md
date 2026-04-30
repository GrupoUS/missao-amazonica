---
description: Failure recovery protocol for post-failure handling. Use after 2+ failed fix attempts.
workflow_type: prompt-chaining
---

# /recover - Structured Failure Recovery

**ARGUMENTS**:$ARGUMENTS

<command-instruction>
Execute Phase 2C Failure Recovery protocol:

## Step 1: STOP

- Halt all current fix attempts immediately
- Do not make any more changes

## Step 2: DOCUMENT

Output a structured failure report:

- What was the original bug/error?
- What fixes were attempted? (list each)
- Why did each fail?
- Current state of the codebase

## Step 3: REVERT (if applicable)

- If changes made the codebase worse, revert to last clean state
- Run `git diff HEAD` to show what changed
- Confirm with user before reverting if uncertain

## Step 4: CONSULT evaluator (Mode 3)

- Delegate the failure report to evaluator agent (Mode 3: Architecture Analysis)
- Prompt format:
  "Here is a failure I cannot resolve: [DOCUMENT output]. Analyze root cause and recommend approach."

## Step 5: REPORT TO USER

- Present evaluator analysis
- Present options with effort estimates
- Ask user how to proceed
  </command-instruction>
