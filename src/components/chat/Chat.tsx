import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, ArrowRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

interface Tables {
  MESSAGES: string;
  USERS: string;
  [key: string]: string;
}

const DEFAULT_TABLES = {
  MESSAGES: 'chat_messages',
  USERS: 'chat_users'
} as const;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  created_at: string;
  user_id: string;
  user_name: string;
  admission_id: string;
  phone_number: string;
  timestamp?: Date; // Keep for backward compatibility
}

interface UserInfo {
  name: string;
  admissionId: string;
  phoneNumber: string;
}

interface ChatProps {
  userId: string;
}

export function Chat({ userId }: ChatProps) {
  const [tables, setTables] = useState<Tables>(DEFAULT_TABLES);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [name, setName] = useState('');
  const [admissionId, setAdmissionId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async (currentAdmissionId: string) => {
    if (!tables.MESSAGES) return;
    
    try {
      console.log('Loading messages for admission ID:', currentAdmissionId);
      const { data, error } = await supabase
        .from(tables.MESSAGES)
        .select('*')
        .eq('admission_id', currentAdmissionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        throw error;
      }

      if (data?.length > 0) {
        console.log('Loaded messages:', data);
        setMessages(data.map(msg => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender,
          created_at: msg.created_at,
          timestamp: new Date(msg.created_at), // For backward compatibility
          user_id: msg.user_id,
          user_name: msg.user_name,
          admission_id: msg.admission_id,
          phone_number: msg.phone_number
        })));
      } else {
        console.log('No messages found, creating welcome message');
        const welcomeMessage = {
          text: `Hello ${name.trim()}! How can I help you today?`,
          sender: 'bot' as const,
          user_id: 'bot',
          user_name: 'Support Bot',
          admission_id: currentAdmissionId,
          phone_number: phoneNumber
        };

        const { data: insertedMessage, error: insertError } = await supabase
          .from(tables.MESSAGES)
          .insert(welcomeMessage)
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting welcome message:', insertError);
          throw insertError;
        }

        console.log('Welcome message inserted successfully:', insertedMessage);
        setMessages([{
          ...welcomeMessage,
          id: insertedMessage.id,
          created_at: insertedMessage.created_at,
          timestamp: new Date(insertedMessage.created_at)
        }]);
      }
    } catch (error) {
      console.error('Error in loadMessages:', error);
    }
  }, [name, phoneNumber, tables]);

  const handleUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !admissionId.trim() || !phoneNumber.trim()) return;

    setIsLoading(true);
    try {
      console.log('Saving user info...', { name, admissionId, phoneNumber });
      const { data: userData, error: userError } = await supabase
        .from(tables.USERS)
        .upsert(
          {
            admission_id: admissionId.trim(),
            name: name.trim(),
            phone_number: phoneNumber.trim(),
            last_active: new Date().toISOString()
          },
          { onConflict: 'admission_id' }
        )
        .select()
        .single();

      if (userError) {
        console.error('Error saving user:', userError);
        throw userError;
      }

      console.log('User saved successfully:', userData);
      const newUserInfo = {
        name: userData.name,
        admissionId: userData.admission_id,
        phoneNumber: userData.phone_number
      };

      setUserInfo(newUserInfo);
      await loadMessages(userData.admission_id);
    } catch (error) {
      console.error('Error in handleUserInfoSubmit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !userInfo || isLoading) return;

    const userMessage = {
      text: inputValue,
      sender: 'user' as const,
      user_id: userId,
      user_name: userInfo.name,
      admission_id: userInfo.admissionId,
      phone_number: userInfo.phoneNumber
    };

    console.log('Sending user message:', userMessage);

    setIsLoading(true);
    try {
      // Save user message
      const { data: userMsgData, error: userMsgError } = await supabase
        .from(tables.MESSAGES)
        .insert(userMessage)
        .select()
        .single();

      if (userMsgError) {
        console.error('Error saving user message:', userMsgError);
        throw userMsgError;
      }

      console.log('User message saved:', userMsgData);

      // Add bot response
      const botMessage = {
        text: `Thank you for your message, ${userInfo.name}. We have received your inquiry and will forward it to our support team. A representative will contact you at ${userInfo.phoneNumber} soon.`,
        sender: 'bot' as const,
        user_id: 'bot',
        user_name: 'Support Bot',
        admission_id: userInfo.admissionId,
        phone_number: userInfo.phoneNumber
      };

      const { data: botMsgData, error: botMsgError } = await supabase
        .from(tables.MESSAGES)
        .insert(botMessage)
        .select()
        .single();

      if (botMsgError) {
        console.error('Error saving bot message:', botMsgError);
        throw botMsgError;
      }

      console.log('Bot message saved:', botMsgData);
      setInputValue('');

      // Update messages state with both messages
      setMessages(prev => [
        ...prev,
        { 
          ...userMessage, 
          id: userMsgData.id, 
          created_at: userMsgData.created_at,
          timestamp: new Date(userMsgData.created_at) 
        },
        { 
          ...botMessage, 
          id: botMsgData.id, 
          created_at: botMsgData.created_at,
          timestamp: new Date(botMsgData.created_at) 
        }
      ]);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load tables on component mount
  useEffect(() => {
    const loadTables = async () => {
      try {
        // If we need to load tables dynamically in the future, we can do it here
        // For now, we'll use the default tables
        setTables(DEFAULT_TABLES);
      } catch (error) {
        console.error('Error loading tables:', error);
      }
    };

    loadTables();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    if (!userInfo || !tables.MESSAGES) return;

    console.log('Setting up real-time subscription for admission ID:', userInfo.admissionId);
    const subscription = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: tables.MESSAGES,
          filter: `admission_id=eq.${userInfo.admissionId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new;
          
          // Check if message already exists in state to prevent duplicates
          setMessages(prev => {
            const messageExists = prev.some(msg => msg.id === newMessage.id);
            if (messageExists) return prev; // Skip if message already exists
            
            return [...prev, {
              id: newMessage.id,
              text: newMessage.text,
              sender: newMessage.sender,
              created_at: newMessage.created_at,
              timestamp: new Date(newMessage.created_at),
              user_id: newMessage.user_id,
              user_name: newMessage.user_name,
              admission_id: newMessage.admission_id,
              phone_number: newMessage.phone_number
            }];
          });
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('Subscription error:', err);
          return;
        }
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(subscription);
    };
  }, [userInfo]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!userInfo) {
    return (
      <div className="flex flex-col h-[500px] items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">Welcome to Support Chat</h3>
            <p className="text-muted-foreground">Please provide your details to start chatting</p>
          </div>
          <form onSubmit={handleUserInfoSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admissionId">Admission ID</Label>
              <Input
                id="admissionId"
                value={admissionId}
                onChange={(e) => setAdmissionId(e.target.value)}
                placeholder="Enter your admission ID"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Start Chat'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h3 className="font-medium">Support Chat</h3>
          <p className="text-xs text-muted-foreground">We're here to help you 24/7</p>
        </div>
        <div className="text-xs text-muted-foreground">
          ID: {userInfo.admissionId}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-muted rounded-bl-none'
              }`}
            >
              <div className="flex-shrink-0 mr-2">
                {message.sender === 'user' ? (
                  <User className="h-4 w-4 mt-1" />
                ) : (
                  <Bot className="h-4 w-4 mt-1" />
                )}
              </div>
              <div>
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !inputValue.trim()}
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Chat;