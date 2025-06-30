<h1>Home</h1>
<div>
  { message }
</div>
<script>
  import LuigiClient from '@luigi-project/client';
  import { onMount } from 'svelte';

  let message = $state('The app loaded without Luigi');

  onMount(() => {
    LuigiClient.addInitListener(() => {
      message = 'Luigi Client initialized.'
    });
    LuigiClient.addContextUpdateListener(() => {
      message = 'Luigi Client updated.'
    });
  });
</script>
