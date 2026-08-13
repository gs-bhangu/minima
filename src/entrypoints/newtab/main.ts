import { mount } from 'svelte';
import App from './App.svelte';
import '../../styles/app.css';

export default mount(App, {
  target: document.getElementById('app')!,
});
