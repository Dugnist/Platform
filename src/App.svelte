<script>
  // Router
  import { Router, Route, Link } from 'yrv';
  // Additional
  import Variables from 'svelte-atoms/Variables.svelte';
  // Pages
  import Install from './modules/Install/pages/Install.svelte';
  import MainPage from './modules/Main/pages/MainPage.svelte';

  import NL from './plugins/neutralino';
  // Used for SSR. A falsy value is ignored by the Router.
  export let url = null;

  let message = '';
</script>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  span {
    cursor: pointer;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<main>
  <Variables />
  <Router {url}>
    <nav>
      <Link href="/">Home</Link>
      <Link href="/#install">Install</Link>
    </nav>
    <div>
      <!-- <Route fallback>Not found</Route> -->
      <Route exact path="/#install" component={Install} />
      <Route exact path="/" component={MainPage} />
    </div>
  </Router>

  <br />
  <br />
  <hr />
  <br />
  <span id="info" />
  <br />
  <button
    on:click={() => NL.exec('node -v').then((r) => {
        message = r.stdout;
      })}>
    Click to run console command "node -v" on PC
  </button>
  <br />
  <br />
  <span>{message}</span>
</main>
