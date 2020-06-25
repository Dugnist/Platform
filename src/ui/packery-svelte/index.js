import _Grid from './Grid.svelte';
import _GridItem from './GridItem.svelte';

/**
 * add to your "assets" folder scripts:
 * packery.min.js (https://unpkg.com/packery@2/dist/packery.pkgd.min.js)
 * draggabilly.min.js (https://unpkg.com/draggabilly@2/dist/draggabilly.pkgd.min.js)
 * npm i @bit/dugnist.packery-svelte.packery-svelte
 * import { Grid, GridItem } from "@bit/dugnist.packery-svelte.packery-svelte";
 * <Grid class="grid">
    <GridItem>
        Hello
    </GridItem>
    <GridItem>
        World
    </GridItem>
  </Grid>
 */

export const Grid = _Grid;
export const GridItem = _GridItem;

export default () => 'version 0.0.3';
