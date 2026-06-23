import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel'
import DOMPurify from 'dompurify';
import Editor from 'react-simple-wysiwyg';
import { useModal } from '../components/modal';

const processText = (input) => {
    // Adiciona um hook ao DOMPurify para forçar target="_blank" em todos os links
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
        // Verifica se o nó é um link (tag <a>)
        if (node.tagName === 'A') {
            node.setAttribute('target', '_blank'); // Adiciona target="_blank"
        }
    });

    return input.split('\n').map((line, index) => {
        const sanitizedLine = DOMPurify.sanitize(line, { ADD_ATTR: ['target'] });
        return <p key={`line_${index}`} dangerouslySetInnerHTML={{ __html: sanitizedLine }}></p>;
    });
};


class TextModel extends SimNodeModel {

    kind = 'text'
    text = 'Annotation...'
    tags = ['text', 'annotation', 'note', 'comment', 'label', 'description', 'block']
    CGenUID = 'txt';
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
    
    serialize() {
        const data = super.serialize();
        return {
            ...data,
            content: this.text
        };
      }
    
      deserialize(event) {
          super.deserialize(event);
          this.text = event.data.content;
      }

}

export default TextModel