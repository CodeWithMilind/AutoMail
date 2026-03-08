import re
from bs4 import BeautifulSoup

def clean_email_body(html_content):
    """
    Remove HTML, CSS, and limit text to 1500 characters.
    """
    if not html_content:
        return ""
    
    # Use BeautifulSoup to strip HTML tags
    soup = BeautifulSoup(html_content, "html.parser")
    
    # Remove script and style elements
    for script_or_style in soup(["script", "style"]):
        script_or_style.decompose()
        
    # Get text
    text = soup.get_text(separator=" ")
    
    # Remove excessive whitespace
    text = re.sub(r"\s+", " ", text).strip()
    
    # Limit characters
    return text[:1500]
