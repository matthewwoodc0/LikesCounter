import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Counter from "@/components/ui/counter";
import { 
  useCountersList, 
  useLikes, 
  LikeCounter
} from "@/hooks/useLikes";
import { 
  Minus, 
  ThumbsUp, 
  Plus, 
  Menu, 
  MessageSquare, 
  User,
  Edit2,
  Check,
  X,
  ArrowLeft
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

const Home = () => {
  const [activeCounterId, setActiveCounterId] = useState<string>("default");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState<boolean>(false);
  const [editNameDialogOpen, setEditNameDialogOpen] = useState<boolean>(false);
  const [newChatName, setNewChatName] = useState<string>("");
  const [editedName, setEditedName] = useState<string>("");
  
  const isMobile = useIsMobile();
  const { counters, createCounter, isLoading: countersLoading } = useCountersList();
  const { 
    counter,
    likes, 
    name, 
    increment, 
    decrement, 
    updateName,
    isLoading
  } = useLikes(activeCounterId);
  
  const addButtonRef = useRef<HTMLButtonElement>(null);

  // Set sidebar open by default on larger screens
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Update the edited name when the active counter changes
  useEffect(() => {
    setEditedName(name);
  }, [name, activeCounterId]);

  const handleSwitchCounter = (counterId: string) => {
    setActiveCounterId(counterId);
    if (isMobile) {
      setSidebarOpen(false); // Close sidebar on mobile after selection
    }
  };

  const handleCreateNewChat = () => {
    if (newChatName.trim()) {
      const newId = createCounter(newChatName.trim());
      setActiveCounterId(newId);
      setNewChatName("");
      setNewChatDialogOpen(false);
      if (isMobile) {
        setSidebarOpen(false); // Close sidebar on mobile after creating
      }
    }
  };

  const handleEditName = () => {
    if (editedName.trim()) {
      updateName(editedName.trim());
      setEditNameDialogOpen(false);
    }
  };

  const handleRemoveLike = () => {
    decrement();
  };

  const handleAddLike = () => {
    increment();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Add keyboard event listener for spacebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.key === " ") {
        event.preventDefault(); // Prevent scrolling on spacebar press
        
        // Add visual feedback to the button
        if (addButtonRef.current) {
          addButtonRef.current.classList.add("bg-primary-900");
          setTimeout(() => {
            addButtonRef.current?.classList.remove("bg-primary-900");
          }, 150);
        }
        
        increment();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [increment]);

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`bg-white shadow-md transition-all duration-300 flex flex-col fixed md:relative z-20 h-full ${
          sidebarOpen 
            ? "left-0 w-[85%] sm:w-[60%] md:w-64" 
            : "left-[-100%] md:left-0 md:w-0 overflow-hidden"
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Like Counters</h2>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setNewChatDialogOpen(true)}
              className="hover:bg-gray-100 mr-1"
            >
              <Plus className="h-5 w-5" />
            </Button>
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="hover:bg-gray-100 md:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {countersLoading ? (
            <div className="p-4">Loading...</div>
          ) : (
            <ul>
              {counters.map((counter: LikeCounter) => (
                <li 
                  key={counter.id}
                  onClick={() => handleSwitchCounter(counter.id)}
                  className={`p-3 cursor-pointer hover:bg-gray-100 flex items-center ${
                    activeCounterId === counter.id ? "bg-gray-100" : ""
                  }`}
                >
                  <User className="h-5 w-5 mr-3 text-gray-500" />
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium truncate">{counter.name}</div>
                    <div className="text-sm text-gray-500">{counter.count} likes</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <header className="bg-white p-3 md:p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleSidebar}
              className="mr-2 md:mr-4"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen && !isMobile ? <ArrowLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-lg md:text-xl font-semibold truncate">{name}</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditNameDialogOpen(true)}
            className="hover:bg-gray-100"
            aria-label="Edit name"
          >
            <Edit2 className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Edit Name</span>
          </Button>
        </header>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-3 md:p-4">
          <Card className="shadow-lg rounded-xl w-full max-w-[90%] sm:max-w-md">
            <CardContent className="p-5 sm:p-8 md:p-10">
              <div className="text-center">
                <div className="mb-6 md:mb-8 relative">
                  <Counter value={likes} isLoading={isLoading} />
                  <p className="text-gray-500 mt-2">Likes</p>
                </div>

                <Button
                  ref={addButtonRef}
                  onClick={handleAddLike}
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium py-2 md:py-3 px-4 md:px-8 rounded-lg text-lg transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 w-full"
                >
                  <ThumbsUp className="h-5 w-5 mr-2" />
                  Add Like
                </Button>

                <Button
                  variant="outline"
                  onClick={handleRemoveLike}
                  disabled={likes === 0 || isLoading}
                  className="mt-3 md:mt-4 flex items-center justify-center px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-200 shadow-sm transition-colors w-full"
                >
                  <Minus className="h-5 w-5 mr-1" />
                  Remove Like
                </Button>

                <p className="mt-3 md:mt-4 text-xs sm:text-sm text-gray-500">
                  Press the button or spacebar to increment
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Chat Dialog */}
      <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Counter</DialogTitle>
            <DialogDescription>
              Create a new likes counter with a custom name.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter a name for the counter"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateNewChat();
              }}
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setNewChatDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateNewChat}
              className="w-full sm:w-auto"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Name Dialog */}
      <Dialog open={editNameDialogOpen} onOpenChange={setEditNameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Counter Name</DialogTitle>
            <DialogDescription>
              Change the name of the current counter.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter a new name"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditName();
              }}
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setEditNameDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditName}
              className="w-full sm:w-auto"
            >
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
