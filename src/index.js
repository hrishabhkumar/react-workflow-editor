import { library } from '@fortawesome/fontawesome-svg-core'
import EditorContainer from './editor/EditorContainer';

const icons = require('@fortawesome/free-solid-svg-icons');

library.add(...Object.values(icons.fas));

export default EditorContainer;
