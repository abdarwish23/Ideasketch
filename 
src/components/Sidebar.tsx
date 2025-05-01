const Sidebar: React.FC<SidebarProps> = ({
  chatHistory,
  // Provide default no-op functions if props are not passed
  onSelectChat = () => {},
  onCreateNewChat = () => {},
  currentChatId = null,
}) => {
            {chatHistory.map((chat) => (
              <li
                key={chat.id}
                onClick={() => {
                  console.log(`Clicked on chat: ${chat.id}`);
                  onSelectChat(chat.id);
                }}
                // Enhanced styling with active state highlight
                className={`
                  px-3 py-2 rounded-md cursor-pointer text-sm
                  ${currentChatId === chat.id 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 font-medium' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                  transition-colors duration-200 ease-in-out truncate
                  border-l-2 
                  ${currentChatId === chat.id 
                    ? 'border-blue-500 dark:border-blue-400' 
                    : 'border-transparent'
                  }
                `}
                title={chat.title} // Add title attribute for long names
              >
                {chat.title}
              </li>
