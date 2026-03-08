import React, { createContext, useContext, useState } from 'react';

const CursorContext = createContext();

export const CursorProvider = ({ children }) => {
    const [cursorType, setCursorType] = useState('default');

    React.useEffect(() => {
        const handleMouseOver = (e) => {
            if (e.target.closest('a, button, [role="button"]')) {
                setCursorType('hover');
            }
        };

        const handleMouseOut = (e) => {
            const target = e.target.closest('a, button, [role="button"]');
            const related = e.relatedTarget?.closest?.('a, button, [role="button"]');

            // Only set to default if we are leaving the interactive element entirely
            if (target && !related) {
                setCursorType('default');
            }
        };

        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);

        return () => {
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseout', handleMouseOut);
        };
    }, []);

    // Keep handlers for manual overrides if needed
    const cursorHandlers = {
        onMouseEnter: () => setCursorType('hover'),
        onMouseLeave: () => setCursorType('default'),
    };

    return (
        <CursorContext.Provider value={{ cursorType, cursorHandlers }}>
            {children}
        </CursorContext.Provider>
    );
};

export const useCursor = () => useContext(CursorContext);
