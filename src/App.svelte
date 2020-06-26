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

  // test
  // const exec = () =>
  //   new Promise((res, rej) => {
  //     try {
  //       window.Neutralino.os.runCommand(
  //         'help',
  //         (data) => {
  //           message = data;
  //           res(data);
  //         },
  //         () => {
  //           rej('error');
  //           console.log('errror');
  //         }
  //       );
  //     } catch (error) {
  //       console.log(error.message);
  //       message = error.message;
  //       rej(error.message);
  //     }
  //   });
  let message = '';
  // end test
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
  <div
    on:click={() => NL.help().then((r) => {
        message = r;
      })}>
    Run cmd command
  </div>
  <br />
  <span id="info">{message}</span>
</main>
