/**
 * Converts HTML content to plain text for copying purposes
 * Removes HTML tags while preserving readable formatting
 */
export const htmlToPlainText = (html: string): string => {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Helper function to process text nodes and convert HTML structure to plain text
    const extractTextContent = (element: Element): string => {
        let result = '';
        
        for (const child of Array.from(element.childNodes)) {
            if (child.nodeType === Node.TEXT_NODE) {
                // Add text content
                result += child.textContent || '';
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                const childElement = child as Element;
                const tagName = childElement.tagName.toLowerCase();
                
                switch (tagName) {
                    case 'br':
                        result += '\n';
                        break;
                    case 'p':
                        if (result && !result.endsWith('\n')) {
                            result += '\n';
                        }
                        result += extractTextContent(childElement);
                        result += '\n';
                        break;
                    case 'li':
                        result += '• ' + extractTextContent(childElement);
                        result += '\n';
                        break;
                    case 'ul':
                    case 'ol':
                        if (result && !result.endsWith('\n')) {
                            result += '\n';
                        }
                        result += extractTextContent(childElement);
                        break;
                    default:
                        // For other tags (b, strong, i, em, u, a), just extract text content
                        result += extractTextContent(childElement);
                        break;
                }
            }
        }
        
        return result;
    };

    const plainText = extractTextContent(tempDiv);
    
    // Clean up extra newlines and whitespace
    return plainText
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple newlines with double newline
        .replace(/^\s+|\s+$/g, '') // Trim whitespace from start and end
        .replace(/[ \t]+/g, ' '); // Replace multiple spaces/tabs with single space
};