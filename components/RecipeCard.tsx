
import React from 'react';

interface RecipeCardProps {
  image: string;
  name: string;
  tags: string[];
  onClick?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ image, name, tags, onClick }) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group cursor-pointer"
      onClick={onClick}
    >
      <img src={image} alt={name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 group-hover:text-orange-500 transition-colors">{name}</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span key={tag} className="bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
