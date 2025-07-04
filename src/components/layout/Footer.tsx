import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-800 text-white p-4 mt-8">
            <div className="container mx-auto text-center">
                <p className="text-sm md:text-base">&copy; {new Date().getFullYear()} Application de recettes. Tous droits réservés.</p>
            </div>
        </footer>
    );
};

export default Footer;