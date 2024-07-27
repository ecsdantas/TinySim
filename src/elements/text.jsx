import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodeModel'
import DOMPurify from 'dompurify';
import Editor from 'react-simple-wysiwyg';
import { useModal } from '../components/modal';

const processText = (input) => {
    return input.split('\n').map((line, index) => {
        line = line.replace(/https?:\/\/([^\s\n\<]+)/g, '<a href="http://$1" title="Go to...">$1</a>');
        const sanitizedLine = DOMPurify.sanitize(line)
        return <p key={index} dangerouslySetInnerHTML={{ __html: sanitizedLine }}></p>;
    });
};


class TextModel extends SimNodeModel {

    kind = 'text'
    text = 'Annotation...'
    fontSize = 12

    constructor(options = {}) {
        super({ ...options, name: 'text' });
    }

    icon = () => {
        const width = this.text.length * this.fontSize / 2
        return (
            <div style={{ border: '1px solid #000000', padding: '1px 3px', fontSize: this.fontSize, maxWidth: '200px'}}>
                {processText(this.text)}
            </div>
        )
    }

    settings = _ => {
    
        // Editor interno
        const ControlEditor = () => {
            const [text, setText] = useState(this.text);
            useEffect(()=>{
                this.text = text
                this.component && this.component.forceUpdate();
            })
            return <Editor value={text} onChange={e => setText(e.target.value)} />
        }
        
        useModal.configure(this, 'Annotation Block', <ControlEditor />, true);
    }

}

export default TextModel