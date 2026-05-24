# Practical Workflow System UI Guide

Complete step-by-step guide to using the workflow builder interface.

## 🚀 Getting Started

### 1. Access the Application
1. Open your browser and navigate to: `http://localhost:5175`
2. You'll see the main application dashboard

### 2. Navigate to Workflow Builder
1. Look for navigation menu items (likely "Workflows" or "Workflow Builder")
2. Click to access the workflow builder page
3. You should see three main areas:
   - **Left Sidebar**: Node palette with available node types
   - **Center Canvas**: White grid area where you build workflows
   - **Right Panel**: Configuration panel for selected nodes

## 🎯 Creating Your First Workflow

### 📍 Identifying Connection Handles

Before you start, it's important to know what to look for:

**Start Node (Green):**
- 🟢 **Green handle** at the **bottom** of the node
- This is the **output** - connections go OUT from here
- NO handle at the top (doesn't receive input)

**End Node (Red):**
- 🔴 **Red handle** at the **top** of the node  
- This is the **input** - connections come IN here
- NO handle at the bottom (doesn't output)

**Process Nodes (AI, HTTP, Delay, Webhook):**
- 🔵 **Handle at top** - input (receives connections)
- 🔵 **Handle at bottom** - output (sends connections)
- Can both receive and send connections

**Visual Guide:**
```
Start Node (Green):
┌─────────────┐
│   START     │
└─────────────┘
       ↓ 🟢 (handle here)

End Node (Red):
       ↑ 🔴 (handle here)
┌─────────────┐
│    END      │
└─────────────┘

Process Node (Purple/Orange/Gray):
       ↑ 🔵 (input handle)
┌─────────────┐
│  AI/HTTP    │
└─────────────┘
       ↓ 🔵 (output handle)
```

### Step 1: Add a Start Node
1. In the left sidebar, find the **"Flow"** category
2. Click the **"+ Start"** button (green button)
3. A **Start node** will appear on the canvas
4. The Start node is green and represents where your workflow begins

### Step 2: Add Process Nodes
1. In the left sidebar, choose a node type:
   - **AI Node** (purple): For AI/text processing
   - **HTTP Node** (orange): For API calls
   - **Delay Node** (gray): For waiting/timing
   - **Webhook Node** (blue): For triggering from external events

2. Click the corresponding button to add the node to the canvas
3. Repeat to add multiple nodes as needed

### Step 3: Add an End Node
1. In the left sidebar, find the **"+ End"** button (red button)
2. Click it to add an End node to the canvas
3. The End node is red and represents where your workflow completes

### Step 4: Connect the Nodes
1. **Look for connection handles** on each node:
   - **Start node**: Green dot at the bottom (output handle)
   - **End node**: Red dot at the top (input handle)
   - **Other nodes** (AI, HTTP, Delay): Dots at top (input) and bottom (output)

2. **Hover over a handle** to see it highlight

3. **Click and drag** from a handle to connect:
   - Click on the **bottom handle** (source) of the first node
   - While holding mouse button, drag to the **top handle** (target) of the next node
   - Release when you see the target node highlight

4. **Continue connecting** in your desired sequence:
   - Start → Process Node 1 → Process Node 2 → End

5. **The connections** show as animated lines with arrows

### Connection Tips:
- **Always connect bottom to top**: Source (bottom) → Target (top)
- **Start nodes only have bottom handles**: They only output, don't receive input
- **End nodes only have top handles**: They only receive input, don't output
- **Middle nodes have both**: They can receive from top and output to bottom
- **You can create branches**: Connect one node's bottom to multiple nodes' tops
- **Delete connections**: Click on the connection line and press Delete

## ⚙️ Configuring Nodes

### Selecting a Node
1. **Click on any node** to select it
2. The right panel will show configuration options for that node
3. The selected node will have a blue border

### Configuring Different Node Types

#### AI Node Configuration
1. Select an AI node
2. In the right panel, you'll see:
   - **Prompt**: Text field for your AI prompt
   - **Model**: Dropdown to select AI model (gpt-4, gpt-3.5-turbo, etc.)
   - **Temperature**: Slider (0-2) for creativity level
3. Example prompt: "Generate a welcome message for user {name}"

#### HTTP Node Configuration
1. Select an HTTP node
2. In the right panel, configure:
   - **URL**: The API endpoint (e.g., https://api.example.com/users)
   - **Method**: HTTP method (GET, POST, PUT, DELETE)
   - **Headers**: JSON-formatted headers (e.g., `{"Authorization": "Bearer token"}`)
3. Example:
   - URL: `https://jsonplaceholder.typicode.com/posts/1`
   - Method: `GET`

#### Delay Node Configuration
1. Select a Delay node
2. Configure:
   - **Duration**: Number of seconds to wait
   - **Unit**: Usually seconds
3. Example: Duration: 5, Unit: seconds

#### Start/End Node Configuration
1. Select Start or End node
2. Add description and initial/final data
3. These are mainly for documentation and workflow tracking

## ✅ Validating Your Workflow

### Real-Time Validation
1. Watch the **validation status bar** at the top-left of the canvas
2. It automatically validates as you add/remove nodes and connections
3. Colors indicate status:
   - **Green**: ✓ Workflow is valid
   - **Red**: ✗ Workflow has errors
   - **Gray**: Still validating

### Common Validation Errors
- **"Add a Start node to begin the workflow"**: You need a Start node
- **"Add an End node to complete the workflow"**: You need an End node
- **"End node is not reachable from Start node"**: Check your connections
- **"Node is not connected to Start"**: Some nodes are disconnected
- **Configuration errors**: Missing required fields like prompt or URL

### Fixing Validation Issues
1. Read the specific error message in the validation bar
2. Add missing nodes (Start/End)
3. Check connections - ensure all nodes are connected to Start
4. Fill in required configuration fields
5. Validation will update automatically when fixed

## 🚀 Executing Your Workflow

### Before Execution
1. Ensure validation shows **"✓ Workflow is valid"**
2. Configure all nodes with required parameters
3. Check that all connections are correct
4. The **Execute button** will be enabled only when valid

### Running the Workflow
1. Click the **"Execute" button** (green) in the top toolbar
2. Button changes to **"Cancel"** (red) during execution
3. Watch the nodes execute in order:
   - **Blue status**: Node is currently running
   - **Green status**: Node completed successfully
   - **Red status**: Node failed

### Execution Timeline
- **Start Node**: ~0.5 seconds (immediate)
- **AI Node**: 2-4 seconds (simulates AI processing)
- **HTTP Node**: 0.5-2 seconds (simulates API call)
- **Delay Node**: Uses your configured duration
- **End Node**: ~0.5 seconds (immediate)

### Canceling Execution
1. While running, click the **"Cancel"** button
2. Execution stops immediately
3. Node statuses remain at their current state
4. Click **"Reset"** to clear statuses and try again

## 🎨 Using the Demo Panel

### Accessing Demo Panel
1. Click the **"Show Demo"** button in the bottom-right corner
2. A demo panel overlays the canvas
3. Shows three pre-built example workflows

### Loading Example Workflows
1. **Simple Linear Workflow**: Click to load a basic 3-node workflow
   - Start → AI → End
   - Great for understanding the basics

2. **Complex Branching Workflow**: Click to load a multi-path workflow
   - Start → AI + HTTP (parallel) → AI → HTTP → End
   - Shows parallel execution and branching

3. **Circular Monitoring Workflow**: Click to load a continuous workflow
   - Start → HTTP → AI → Delay → End → (back to Start)
   - Demonstrates circular/recurring workflows

### Testing with Demo Panel
1. Select an example workflow
2. Review the workflow statistics (nodes, connections, validation)
3. Click **"Execute Workflow"** to run it
4. Watch the execution in real-time
5. Use **"Reset"** to try another example

### Closing Demo Panel
1. Click **"Hide Demo"** button
2. Demo panel closes, returning to normal workflow builder
3. Your current workflow is preserved

## 🔧 Advanced Workflow Patterns

### Creating Branching Workflows
1. Add Start node
2. Add two (or more) process nodes (e.g., AI node 1, AI node 2)
3. Connect Start to both process nodes (two separate edges)
4. Add End node
5. Connect both process nodes to End
6. Result: Parallel execution of both branches

### Creating Sequential Workflows
1. Add Start node
2. Add process nodes in sequence (Node 1, Node 2, Node 3)
3. Connect: Start → Node 1 → Node 2 → Node 3 → End
4. Result: Sequential execution one after another

### Creating Circular Workflows
1. Build a normal workflow: Start → Process → End
2. Add an additional edge from End back to Start
3. Result: Workflow runs continuously in a loop
4. Use **"Cancel"** to stop the loop

### Creating Complex Workflows
1. Combine branching and sequential patterns
2. Example: Start → (AI + HTTP) → Merge → AI → HTTP → End
3. This demonstrates real-world workflow complexity

## 💡 Practical Use Cases

### Use Case 1: User Onboarding Workflow
```
Start → Generate Welcome Email (AI) → Get User Profile (HTTP) → 
Send Recommendations (AI) → Send Email (HTTP) → End
```

**Steps:**
1. Add Start node with user data
2. Add AI node to generate welcome message
3. Add HTTP node to fetch user profile
4. Add AI node to generate product recommendations
5. Add HTTP node to send email via API
6. Add End node to complete onboarding
7. Connect all nodes sequentially

### Use Case 2: Data Processing Pipeline
```
Start → Fetch Data (HTTP) → Process Data (AI) → 
Transform (AI) → Save Results (HTTP) → End
```

**Steps:**
1. Add Start node
2. Add HTTP node to fetch data from API
3. Add AI node to process and analyze data
4. Add AI node to transform results
5. Add HTTP node to save processed data
6. Add End node
7. Connect in sequence

### Use Case 3: Continuous Monitoring
```
Start → Check Health (HTTP) → Analyze (AI) → 
Wait (Delay) → End → (loop back to Start)
```

**Steps:**
1. Add Start node
2. Add HTTP node to check system health
3. Add AI node to analyze health data
4. Add Delay node (e.g., 60 seconds)
5. Add End node
6. Connect all in sequence
7. Add edge from End back to Start for circular execution

## 🛠️ Workflow Builder Tools

### Canvas Toolbar (Top-Left)
- **Layout**: Auto-arrange nodes neatly
- **Undo/Redo**: Step backward/forward through changes
- **Export**: Download workflow as JSON file
- **Save**: Save workflow to server
- **Execute**: Run the workflow
- **Reset**: Clear execution statuses
- **Import**: Upload workflow from JSON file

### Node Operations
- **Drag nodes**: Click and drag to reposition
- **Delete nodes**: Select node and press Delete/Backspace
- **Copy/Paste**: Ctrl+C to copy, Ctrl+V to paste
- **Connect nodes**: Drag from one node to another
- **Delete connections**: Select edge and press Delete

### Keyboard Shortcuts
- **Escape**: Clear selection
- **Ctrl+C**: Copy selected node
- **Ctrl+V**: Paste node
- **Ctrl+Z**: Undo
- **Ctrl+Shift+Z**: Redo
- **Delete/Backspace**: Delete selected node or edge

## 📊 Monitoring Execution

### Visual Feedback
- **Node Borders**: Blue when loading, normal when idle
- **Status Badges**: Show current node status
- **Animated Edges**: Show execution direction
- **Color Coding**: Green for success, red for error, blue for running

### Execution Status
- **Top-left panel**: Shows overall execution status
- **"idle"**: Not running
- **"running"**: Currently executing
- **"completed"**: Finished successfully
- **"failed"**: Stopped due to error
- **"cancelled"**: Stopped by user

### Node-Level Status
- Each node shows its individual status
- Watch nodes change color as execution progresses
- Failed nodes show in red with error details

## 🚨 Troubleshooting

### Workflow Won't Execute
**Problem**: Execute button is disabled
**Solution**:
- Check validation status bar (must be green)
- Ensure you have both Start and End nodes
- Verify all nodes are connected to Start
- Fill in required configuration fields

### Can't Connect Nodes
**Problem**: Unable to drag connections between nodes
**Solution**:
- **Look for connection handles**: Small colored dots on node edges
  - Start node: Green handle at bottom (output only)
  - End node: Red handle at top (input only)
  - Other nodes: Handles at top (input) and bottom (output)
- **Hover over the handle**: It should highlight when you hover
- **Click and drag from handle**: Click on the handle and drag to another node
- **Ensure proper direction**:
  - Always connect from bottom handle (source) to top handle (target)
  - Start nodes only have output handles (bottom)
  - End nodes only have input handles (top)
- **Check if nodes are too close**: Move nodes apart if handles overlap
- **Refresh the page**: Sometimes browser cache needs clearing

### Nodes Not Executing in Order
**Problem**: Nodes execute in wrong order
**Solution**:
- Check your edge connections
- Ensure edges point in correct direction
- Verify source/target of each connection

### Execution Stops Midway
**Problem**: Workflow stops at a node
**Solution**:
- Check if node failed (red status)
- Verify node configuration (URL, prompt, etc.)
- Try executing again (some failures are random simulation)

### Circular Workflow Not Looping
**Problem**: Circular workflow runs once then stops
**Solution**:
- Verify End node connects back to Start node
- Check that the connection exists and is valid
- Ensure you're not canceling execution manually

## 🎓 Best Practices

### Workflow Design
1. **Always Start with Start**: Begin every workflow with a Start node
2. **Always End with End**: Complete every workflow with an End node
3. **Connect Everything**: Ensure all nodes connect back to Start eventually
4. **Use Branching**: Execute tasks in parallel when possible
5. **Add Delays**: Use Delay nodes to pace external API calls

### Configuration
1. **Fill Required Fields**: Complete all required configuration
2. **Test URLs**: Use real API endpoints for HTTP nodes
3. **Write Clear Prompts**: Be specific in AI node prompts
4. **Set Reasonable Delays**: Don't make delays too long for testing

### Validation
1. **Watch the Validation Bar**: Fix errors as they appear
2. **Read Error Messages**: They tell you exactly what's wrong
3. **Test Incrementally**: Validate after each major change
4. **Use Warnings**: Address warnings to improve workflow quality

### Execution
1. **Start Simple**: Test with simple workflows first
2. **Monitor Progress**: Watch node statuses during execution
3. **Handle Failures**: Click Reset and try again if execution fails
4. **Cancel Gracefully**: Use Cancel button to stop long executions

## 📝 Quick Reference

### Minimum Valid Workflow
- 1 Start node
- 1 End node
- 1 connection from Start to End
- All required fields configured

### Most Common Workflow
- Start → Process Node(s) → End
- All nodes connected sequentially
- Configuration completed

### Advanced Workflow
- Start → Multiple branches → Merge → End
- Parallel execution
- Complex data flow

---

**Ready to build your workflow?**
1. Open http://localhost:5173
2. Navigate to Workflow Builder
3. Add Start node
4. Add your process nodes
5. Add End node
6. Connect everything
7. Configure nodes
8. Validate
9. Execute!

Happy workflow building! 🚀
