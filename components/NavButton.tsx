interface NavButtonProps {
  label: string;
  icon?: string;
  hideLabel?: boolean; 
  active?: boolean;
  onClick?: () => void;
  isDropdownOpen?: boolean; 
  showArrow?: boolean;      
}

export function NavButton({ 
  label, 
  icon, 
  active, 
  onClick, 
  isDropdownOpen, 
  showArrow,
  hideLabel 
}: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between
        px-3 py-3 rounded-xl
        cursor-pointer transition-all duration-200
        ${active ? "bg-purple-100 font-semibold text-purple-700" : "text-gray-700"}
        ${!hideLabel ? "hover:bg-purple-100/50 hover:shadow-sm" : ""}
      `}
    >
      <div className={`flex items-center ${hideLabel ? "justify-center w-full" : "space-x-3"}`}>
        {icon && (
          <img 
            src={icon} 
            alt={`${label} Icon`} 
            /* Added flex-shrink-0 and fixed dimensions */
            className="w-5 h-5 min-w-[20px] min-h-[20px] flex-shrink-0 opacity-80" 
          />
        )}
        
        {!hideLabel && (
          <span className="text-sm whitespace-nowrap overflow-hidden">
            {label}
          </span>
        )}
      </div>

      {showArrow && !hideLabel && (
        <img
          src="/arrow.png"
          alt="Dropdown Arrow"
          /* Added flex-shrink-0 here too */
          className={`w-4 h-4 flex-shrink-0 transform transition-transform duration-300 ${
            isDropdownOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      )}
    </button>
  );
}