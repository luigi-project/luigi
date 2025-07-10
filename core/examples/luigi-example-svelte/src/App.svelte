<script>
  import { Router, Route } from 'svelte-tiny-router';
  import Home from './routes/Home.svelte';
  import Sample1 from './routes/Sample1.svelte';
  import Sample2 from './routes/Sample2.svelte';

  /**
   * @typedef {Object} Props
   * @property {string} [url]
   */

  /** @type {Props} */
  let { url = '' } = $props();
</script>

<div class="fd-page__content">
  <Router {url}>
    <Route path="" component={Home} />
    <Route path="/home/sample1" component={Sample1} />
    <Route path="/home/sample2" component={Sample2} />
  </Router>
</div>
