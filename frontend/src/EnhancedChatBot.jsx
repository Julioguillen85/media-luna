import React from 'react';
import ChatWindow from './components/chat/ChatWindow';

export default function EnhancedChatBot(props) {
    return <ChatWindow {...props} onClose={props.setIsOpen ? () => props.setIsOpen(false) : props.onClose} />;
}
