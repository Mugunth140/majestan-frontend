import re

with open('src/components/site/views/IndexView.tsx', 'r') as f:
    content = f.read()

# Replace hardcoded coimbatore in URLs
content = re.sub(r'coimbatore', '${citySlug}', content)
# Now we need to wrap the URLs in backticks instead of double quotes if they contain ${citySlug}
content = re.sub(r'"([^"]*\$\{citySlug\}[^"]*)"', r'`\1`', content)

# Replace "Coimbatore" with ${location} in text
content = re.sub(r'Coimbatore', '${location}', content)
# Wrap those in backticks if they are currently strings
content = re.sub(r'"([^"]*\$\{location\}[^"]*)"', r'`\1`', content)

# Since these use location, we need to move the arrays inside the IndexView component or a hook.
# Let's find the start of IndexView
start_idx = content.find('export function IndexView')

# Find the start of the variables (const rotatingWords)
var_start_idx = content.find('const rotatingWords')

if start_idx != -1 and var_start_idx != -1:
    # Wrap the variables in a hook
    variables_code = content[var_start_idx:start_idx]
    
    # We will put the variables inside IndexView
    new_component = f"""export function IndexView(): React.JSX.Element {{
  const {{ location }} = useLocationContext();
  const citySlug = location.toLowerCase().replace(/[\\s,]+/g, '-');
  
  {variables_code}
  
  """
    # Replace the export function IndexView up to the first open brace
    content = content[:var_start_idx] + new_component + content[start_idx + content[start_idx:].find('{') + 1:]
    
    # Add useLocationContext import
    if "useLocationContext" not in content:
        import_stmt = 'import { useLocationContext } from "@/contexts/LocationContext";\n'
        content = import_stmt + content

    with open('src/components/site/views/IndexView.tsx', 'w') as f:
        f.write(content)
    print("Refactored IndexView.tsx")
else:
    print("Could not find start indices")
