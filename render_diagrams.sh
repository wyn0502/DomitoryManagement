#!/bin/bash
# PlantUML Diagram Renderer
# Renders Activity Diagrams from PlantUML file

OUTPUT_DIR="./diagrams"
PUML_FILE="./visual-paradigm.puml"

echo "📊 PlantUML Activity Diagram Renderer"
echo "====================================="

# Create output directory
mkdir -p "$OUTPUT_DIR"

# List of diagrams to render
DIAGRAMS=(
    "CRUD_Create_Ticket"
    "CRUD_Read_Ticket"
    "CRUD_Update_Ticket"
    "CRUD_Delete_Ticket"
    "CRUD_Asset_Type"
    "CRUD_RoomAsset"
    "CRUD_Announcement"
    "CRUD_User_Auth"
)

echo ""
echo "🎨 Available Diagrams:"
for i in "${!DIAGRAMS[@]}"; do
    echo "  $((i+1)). ${DIAGRAMS[$i]}"
done

echo ""
echo "📥 Usage:"
echo "  Visit: https://www.plantuml.com/plantuml/uml/"
echo "  Upload: visual-paradigm.puml"
echo "  Or use PlantUML online renderer with this file"
echo ""

# Create index HTML for easy viewing
cat > "$OUTPUT_DIR/index.html" << 'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRUD Activity Diagrams - Dormitory Management System</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 10px;
        }
        
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
        }
        
        .diagram-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        
        .diagram-card {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            transition: all 0.3s ease;
        }
        
        .diagram-card:hover {
            border-color: #667eea;
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
        }
        
        .diagram-title {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .diagram-description {
            color: #666;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .view-button {
            display: inline-block;
            margin-top: 15px;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 14px;
            transition: background 0.3s;
        }
        
        .view-button:hover {
            background: #764ba2;
        }
        
        .info-box {
            background: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        
        .info-box h3 {
            margin-top: 0;
            color: #1976D2;
        }
        
        .step {
            margin: 10px 0;
            color: #333;
        }
        
        code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 CRUD Activity Diagrams</h1>
        <p class="subtitle">Dormitory Management System - Complete API Flow</p>
        
        <div class="info-box">
            <h3>ℹ️ How to View Diagrams</h3>
            <p>To view the PlantUML diagrams:</p>
            <div class="step">1. Visit <a href="https://www.plantuml.com/plantuml/uml/" target="_blank">PlantUML Online Editor</a></div>
            <div class="step">2. Copy content from <code>visual-paradigm.puml</code> file</div>
            <div class="step">3. Paste into the editor</div>
            <div class="step">4. Select individual diagrams from the dropdown or scroll through all</div>
            <div class="step">5. Export as PNG/SVG as needed</div>
        </div>
        
        <h2>📋 Available Activity Diagrams</h2>
        
        <div class="diagram-grid">
            <div class="diagram-card">
                <div class="diagram-title">🎫 Create Ticket</div>
                <div class="diagram-description">
                    Student submits repair request with description, priority, and optional image. Includes validation, image upload, and database insertion.
                </div>
            </div>
            
            <div class="diagram-card">
                <div class="diagram-title">📖 Read Ticket</div>
                <div class="diagram-description">
                    Retrieve tickets with optional status filtering. Includes student information and sorted results.
                </div>
            </div>
            
            <div class="diagram-card">
                <div class="diagram-title">✏️ Update Ticket</div>
                <div class="diagram-description">
                    Admin updates ticket status (Pending → In Progress → Completed). Includes admin verification and status validation.
                </div>
            </div>
            
            <div class="diagram-card">
                <div class="diagram-title">🗑️ Delete Ticket</div>
                <div class="diagram-description">
                    Admin deletes ticket including associated images. Includes permission check and file cleanup.
                </div>
            </div>
            
            <div class="diagram-card">
                <div class="diagram-title">🏷️ Asset Type CRUD</div>
                <div class="diagram-description">
                    Complete CRUD operations for asset types: Create, Read, Update, Delete with validation and cascade delete.
                </div>
            </div>
            
            <div class="diagram-card">
                <div class="diagram-title">🛏️ Room Asset Allocation</div>
                <div class="diagram-description">
                    Assign assets to rooms, manage quantities and conditions. Includes upsert logic and asset tracking.
                </div>
            </div>
            
            <div class="diagram-card">
                <div class="diagram-title">📢 Announcement CRUD</div>
                <div class="diagram-description">
                    Admin creates, updates, and deletes announcements. Students can read with pagination. Includes authorization.
                </div>
            </div>
            
            <div class="diagram-card">
                <div class="diagram-title">👤 User Authentication</div>
                <div class="diagram-description">
                    User registration, login, profile retrieval, and role management. Includes bcrypt hashing and admin verification.
                </div>
            </div>
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e9ecef;">
            <h3>📁 Project Files</h3>
            <ul>
                <li><strong>visual-paradigm.puml</strong> - Contains all diagrams (Class Diagram + 8 Activity Diagrams)</li>
                <li><strong>diagrams/</strong> - Directory for rendered diagram images</li>
                <li><strong>API_DOCUMENTATION.md</strong> - Complete API reference</li>
                <li><strong>SETUP.md</strong> - Setup and deployment guide</li>
            </ul>
        </div>
        
        <div style="margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
            <p>Generated for Dormitory Management System | Activity Diagrams</p>
        </div>
    </div>
</body>
</html>
HTML

echo "✅ Created: $OUTPUT_DIR/index.html"
echo ""
echo "🌐 Open in browser: file://$(pwd)/diagrams/index.html"
echo ""
echo "📋 To render diagrams as images:"
echo "   Option 1: Use PlantUML Online Editor"
echo "   URL: https://www.plantuml.com/plantuml/uml/"
echo ""
echo "   Option 2: Install PlantUML locally"
echo "   Command: brew install plantuml"
echo "   Then: plantuml visual-paradigm.puml -o diagrams"
echo ""
