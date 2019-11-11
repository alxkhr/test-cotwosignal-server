async function render() {
  const response = await fetch('/signals');
  console.log('signals', response);
}

render();
