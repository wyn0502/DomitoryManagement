#!/usr/bin/env python3
"""
PlantUML Diagram Renderer using PlantUML Online Service
Extracts and renders all diagrams from visual-paradigm.puml
"""

import requests
import base64
import zlib
import os
import re
import sys
from urllib.parse import quote

def plantuml_encode(text):
    """Encode PlantUML source using the compression algorithm"""
    # PlantUML uses a custom encoding
    # We'll use the simpler URL-safe base64 approach
    encoded = base64.b64encode(text.encode('utf-8')).decode('ascii')
    return encoded

def extract_diagrams(puml_file):
    """Extract individual diagrams from PlantUML file"""
    with open(puml_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    diagrams = {}
    # Match @startuml DIAGRAM_NAME ... @enduml
    pattern = r"@startuml\s+(\w+)(.*?)@enduml"
    matches = re.finditer(pattern, content, re.DOTALL)
    
    for match in matches:
        name = match.group(1)
        body = match.group(2)
        full_diagram = f"@startuml {name}{body}@enduml"
        diagrams[name] = full_diagram
    
    return diagrams

def render_diagram_url(diagram_content):
    """Generate URL for PlantUML online renderer"""
    # Simple encoding for URLs
    encoded = base64.b64encode(diagram_content.encode('utf-8')).decode('ascii')
    # URL for image generation
    url = f"https://www.plantuml.com/plantuml/png/{encoded}"
    return url

def download_diagram(url, output_file):
    """Download rendered diagram from URL"""
    try:
        print(f"  📥 Downloading from PlantUML service...")
        response = requests.get(url, timeout=15)
        
        if response.status_code == 200:
            with open(output_file, 'wb') as f:
                f.write(response.content)
            print(f"  ✅ Saved: {output_file}")
            return True
        else:
            print(f"  ❌ Error: HTTP {response.status_code}")
            return False
    except requests.Timeout:
        print(f"  ⏱️ Timeout: Service taking too long")
        return False
    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
        return False

def create_markdown_viewer(diagrams, output_file):
    """Create a markdown file with all diagram URLs"""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Activity Diagrams - Viewer\n\n")
        f.write("All diagrams rendered from `visual-paradigm.puml`\n\n")
        
        for i, (name, content) in enumerate(diagrams.items(), 1):
            url = render_diagram_url(content)
            f.write(f"## {i}. {name}\n\n")
            f.write(f"![{name}]({url})\n\n")
            f.write(f"**View Online**: [PlantUML Editor](https://www.plantuml.com/plantuml/uml/{quote(content)})\n\n")
            f.write("---\n\n")
    
    print(f"✅ Created: {output_file}")
    return output_file

def main():
    puml_file = "visual-paradigm.puml"
    output_dir = "diagrams"
    
    if not os.path.exists(puml_file):
        print(f"❌ Error: {puml_file} not found!")
        sys.exit(1)
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    print("🎨 PlantUML Activity Diagram Renderer")
    print("=" * 50)
    print()
    
    # Extract diagrams
    print("📖 Extracting diagrams from visual-paradigm.puml...")
    diagrams = extract_diagrams(puml_file)
    print(f"✅ Found {len(diagrams)} diagrams\n")
    
    # List diagrams
    print("📋 Diagrams to render:")
    for i, name in enumerate(diagrams.keys(), 1):
        print(f"  {i}. {name}")
    print()
    
    # Render diagrams
    print("🔄 Rendering diagrams (this may take a moment)...\n")
    success_count = 0
    
    for diagram_name, diagram_content in diagrams.items():
        print(f"Processing: {diagram_name}")
        
        # Generate URL
        url = render_diagram_url(diagram_content)
        output_file = os.path.join(output_dir, f"{diagram_name}.png")
        
        # Download
        if download_diagram(url, output_file):
            success_count += 1
        print()
    
    # Create markdown viewer
    print("📄 Creating markdown viewer...")
    viewer_file = os.path.join(output_dir, "DIAGRAMS.md")
    create_markdown_viewer(diagrams, viewer_file)
    print()
    
    # Summary
    print("=" * 50)
    print(f"✨ Rendering Complete!")
    print(f"   Successful: {success_count}/{len(diagrams)}")
    print(f"   Output: {os.path.abspath(output_dir)}")
    print()
    
    if success_count == len(diagrams):
        print("🎉 All diagrams rendered successfully!")
    elif success_count > 0:
        print("⚠️  Some diagrams may not have rendered. Check the PlantUML service.")
    else:
        print("❌ No diagrams rendered. Please try manually using:")
        print("   https://www.plantuml.com/plantuml/uml/")
    
    print()
    print("📖 View diagrams:")
    print(f"   1. File: {viewer_file}")
    print(f"   2. Browser: Open diagrams/index.html")
    print(f"   3. Editor: https://www.plantuml.com/plantuml/uml/")

if __name__ == "__main__":
    main()
