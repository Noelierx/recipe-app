/**
 * Converts HTML content to plain text for copying purposes
 * Removes HTML tags while preserving readable formatting
 */
export const htmlToPlainText = (html: string): string => {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Helper functions to handle specific HTML elements
    const handleParagraph = (element: Element, result: string): string => {
        if (result && !result.endsWith('\n')) {
            return result + '\n' + extractTextContent(element) + '\n';
        }
        return result + extractTextContent(element) + '\n';
    };

    const handleListItem = (element: Element): string => {
        return '• ' + extractTextContent(element) + '\n';
    };

    const handleList = (element: Element, result: string): string => {
        if (result && !result.endsWith('\n')) {
            return result + '\n' + extractTextContent(element);
        }
        return result + extractTextContent(element);
    };

    // Helper function to process text nodes and convert HTML structure to plain text
    const extractTextContent = (element: Element): string => {
        let result = '';
        
        for (const child of Array.from(element.childNodes)) {
            if (child.nodeType === Node.TEXT_NODE) {
                // Add text content using nullish coalescing
                result += child.textContent ?? '';
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                const childElement = child as Element;
                const tagName = childElement.tagName.toLowerCase();
                
                if (tagName === 'br') {
                    result += '\n';
                } else if (tagName === 'p') {
                    result = handleParagraph(childElement, result);
                } else if (tagName === 'li') {
                    result += handleListItem(childElement);
                } else if (tagName === 'ul' || tagName === 'ol') {
                    result = handleList(childElement, result);
                } else {
                    // For other tags (b, strong, i, em, u, a), just extract text content
                    result += extractTextContent(childElement);
                }
            }
        }
        
        return result;
    };

    const plainText = extractTextContent(tempDiv);
    
    // Clean up extra newlines and whitespace
    return plainText
        .replace(/\n{3,}/g, '\n\n') // Replace 3 or more newlines with double newline
        .trim() // Trim whitespace from start and end
        .replace(/[ \t]+/g, ' '); // Replace multiple spaces/tabs with single space
};