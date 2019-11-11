async function render() {
  const response = await fetch('/signals');
  if (response.ok) {
    const signals = await response.json();
    console.log(
      'signals',
      signals.sort((a, b) => (a.timestamp > b.timestamp ? 1 : b.timestamp > a.timestamp ? -1 : 0)),
    );
  }
}

render();
