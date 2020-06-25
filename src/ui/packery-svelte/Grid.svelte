<script>
  let randID =
    Date.now() + Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  let grid = null;

  const initializeRemarkable = () => {
    if (window.Draggabilly && window.Packery) {
      const elem = document.querySelector(`#packery${randID}`);
      // Init packery
      grid = new Packery(elem, {
        // options
        itemSelector: ".packery-grid-item",
        gutter: 10,
        columnWidth: 250
      });
      // Add draggable
      Array.from(elem.querySelectorAll(".packery-grid-item")).forEach(
        (gridItem, i) => {
          const draggie = new Draggabilly(gridItem);

          // bind drag events to Packery
          grid.bindDraggabillyEvents(draggie);
        }
      );
    }
  };
</script>

<svelte:head>
  <script src="/assets/packery.min.js" on:load={initializeRemarkable}>

  </script>
  <script src="/assets/draggabilly.min.js" on:load={initializeRemarkable}>

  </script>
</svelte:head>

<div id={`packery${randID}`}>
  <slot />
</div>
