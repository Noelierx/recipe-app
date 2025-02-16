import DOMPurify from 'dompurify';

export const sanitizeInstructions = (instructions: string): string => {
    return DOMPurify.sanitize(instructions, {
        ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'u', 'ol', 'ul', 'li', 'a'],
        ALLOWED_ATTR: []
    });
};