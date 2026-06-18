#!/usr/bin/env python3
"""
PlantUML Diagram Generator
Converts PlantUML source to PNG images using PlantUML online API
"""

import requests
import base64
import os
import re

def encode_plantuml(text):
    """Encode PlantUML source to URL-safe format"""
    compressed = os.popen(f'echo "{text}" | java -jar /tmp/plantuml.jar -pipe -p svg').read()
    return compressed

def extract_diagrams(puml_file):
    """Extract individual diagrams from PlantUML file"""
    with open(puml_file, 'r') as f:
        content = f.read()
    
    # Split by @startuml and @enduml
    diagrams = {}
    pattern = r'@startuml\s+(\w+)\s*(.*?)@enduml'
    matches = re.finditer(pattern, content, re.DOTALL)
    
    for match in matches:
        title = match.group(1)
        diagram_content = match.group(2)
        diagrams[title] = f"@startuml {title}\n{diagram_content}@enduml"
    
    return diagrams

def render_with_online_service(diagram_name, diagram_content):
    """Render diagram using PlantUML online service"""
    try:
        # Encode source
        encoded = base64.b64encode(diagram_content.encode()).decode()
        
        # Call PlantUML online service
        url = f"https://www.plantuml.com/plantuml/png/{encoded}"
        
        # For testing, we'll try a different approach
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            return response.content
        else:
            print(f"Error: {response.status_code} for {diagram_name}")
            return None
    except Exception as e:
        print(f"Error rendering {diagram_name}: {e}")
        return None

def save_diagram(diagram_name, content, output_dir):
    """Save diagram image to file"""
    output_file = os.path.join(output_dir, f"{diagram_name}.png")
    
    if content:
        with open(output_file, 'wb') as f:
            f.write(content)
        print(f"✅ Saved: {output_file}")
        return True
    else:
        print(f"❌ Failed to render: {diagram_name}")
        return False

def main():
    puml_file = "/workspaces/DomitoryManagement/visual-paradigm.puml"
    output_dir = "/workspaces/DomitoryManagement/diagrams"
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    print("📊 Extracting diagrams from visual-paradigm.puml...")
    diagrams = extract_diagrams(puml_file)
    
    print(f"\n🎨 Found {len(diagrams)} diagrams:")
    for name in diagrams.keys():
        print(f"  - {name}")
    
    print("\n🔄 Rendering diagrams...")
    success_count = 0
    
    for diagram_name, diagram_content in diagrams.items():
        print(f"\n  Processing: {diagram_name}...")
        image_content = render_with_online_service(diagram_name, diagram_content)
        if save_diagram(diagram_name, image_content, output_dir):
            success_count += 1
    
    print(f"\n✨ Completed! {success_count}/{len(diagrams)} diagrams rendered successfully")
    print(f"📁 Output directory: {output_dir}")

if __name__ == "__main__":
    main()
