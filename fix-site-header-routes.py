import re

file_path = "majestan-frontend/src/components/site/layout/site-header.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add handleProtectedRoute
protect_logic = """
  const handleProtectedRoute = (e: React.MouseEvent, path: string) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setIsAuthModalOpen(true);
    }
  };
"""
if "handleProtectedRoute" not in content:
    content = content.replace("  const detectLocation = async", protect_logic + "\  const detectLocation = async")

# Protect Wishlist
content = re.sub(
    r'<Link href="/wishlist"([^>]*)>',
    r'<Link href="/wishlist"\1 onClick={(e) => handleProtectedRoute(e, "/wishlist")}>',
    content
)

# Protect Rent/Sell Property (Desktop & Mobile)
content = re.sub(
    r'<Link\s+href="/rent-or-sell-your-property"([^>]*)>',
    r'<Link href="/rent-or-sell-your-property"\1 onClick={(e) => { handleProtectedRoute(e, "/rent-or-sell-your-property"); if(isMobileMenuOpen) setIsMobileMenuOpen(false); }}>',
    content
)

# Remove Desktop Auth Block entirely
content = re.sub(
    r'\{/\* Desktop Auth \*/\}.*?\{/\* Mobile Toggle \*/\}',
    r'{/* Mobile Toggle */}',
    content,
    flags=re.DOTALL
)

# Remove Mobile Auth Block entirely
content = re.sub(
    r'<div className="flex! items-center! justify-center! gap-2\.5 rounded-full bg-\[\#27427f\]\/5 px-3 py-2\.5! text-\[13px\]! font-semibold! tracking-\[0\.08em\] text-\[\#27427f\] uppercase">.*?</div>',
    r'',
    content,
    flags=re.DOTALL
)
content = re.sub(
    r'\{isAuthenticated \? \(.*?\) : \(.*?\n\s+\)\}',
    r'',
    content,
    flags=re.DOTALL
)

# Clean up double onClick issues caused by regex if there were existing onClicks
content = content.replace('onClick={() => setIsMobileMenuOpen(false)} onClick=', 'onClick=')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("SiteHeader patched.")
