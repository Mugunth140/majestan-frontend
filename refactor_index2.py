import re

with open('src/components/site/views/IndexView.tsx', 'r') as f:
    content = f.read()

# First, find the start of the IndexView function and the static variables
start_idx = content.find('export function IndexView()')
var_start_idx = content.find('const rotatingWords =')

if start_idx != -1 and var_start_idx != -1:
    variables_code = content[var_start_idx:start_idx]
    
    # 1. Inside variables_code, replace "coimbatore" in URLs
    variables_code = re.sub(r'"([^"]*coimbatore[^"]*)"', lambda m: '`' + m.group(1).replace('coimbatore', '${citySlug}') + '`', variables_code)
    
    # 2. Inside variables_code, replace "Coimbatore" in regular strings
    variables_code = re.sub(r'"([^"]*Coimbatore[^"]*)"', lambda m: '`' + m.group(1).replace('Coimbatore', '${location}') + '`', variables_code)
    
    # Now, let's process the component body
    component_body = content[start_idx:]
    
    # 3. Inside component_body, replace text Coimbatore with {location}
    component_body = re.sub(r'Coimbatore', '{location}', component_body)
    
    # Wait, what if there is a string "Coimbatore" inside the component body like placeholder="Coimbatore"?
    # We should replace "Coimbatore" with {location} for JSX text, and "{location}" for props.
    # Actually, let's just let it be {location} and if it was placeholder="Coimbatore", it becomes placeholder="{location}", which we can fix by replacing `="{location}"` with `={location}`.
    component_body = component_body.replace('="{location}"', '={location}')
    component_body = component_body.replace("{location}'s", "{location}&apos;s")
    
    new_component = f"""export function IndexView(): React.JSX.Element {{
  const {{ location }} = useLocationContext();
  const citySlug = location.toLowerCase().replace(/[\\s,]+/g, '-');
  
  {variables_code}
  
  {component_body[component_body.find('{')+1:]}
"""
    
    # Combine everything
    content = content[:var_start_idx] + new_component
    
    # Add import
    if "useLocationContext" not in content:
        content = 'import { useLocationContext } from "@/contexts/LocationContext";\n' + content
        
    with open('src/components/site/views/IndexView.tsx', 'w') as f:
        f.write(content)
    print("Refactored properly.")
else:
    print("Indices not found.")
