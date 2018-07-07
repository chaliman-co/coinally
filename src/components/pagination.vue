<template>
    <div>
        <!-- Total page count {{totalPageCount}}<hr>
        Active Page {{activePage}}<hr>
        Total Items Count {{totalItemsCount}}<hr>
        Items Count Per Page {{itemsCountPerPage}} -->
        <nav aria-label="pagination" class="pull-right">
            <ul class="pagination pagination-sm">
                <!-- <li class="disabled" v-if="previous">
                    <a href="#" aria-label="Previous">
                        <span aria-hidden="true">« Previous</span>
                    </a>
                </li> -->
                <li v-if="previous">
                    <a href="#" aria-label="Previous">
                        <span aria-hidden="true" @click.prevent="previousPage">« Previous</span>
                    </a>
                </li>
                <!-- <li class="active">
                    <a href="#">20
                        <span class="sr-only">(current)</span>
                    </a>
                </li> -->
                <li v-for="page in totalPageCount" :key="page" v-bind:class="{ active: activePage == page }">
                    <a href="#" @click.prevent="getPage(page)">{{page}}</a>
                </li>
                
                <li v-if="next" >
                    <a href="#" aria-label="Next" @click.prevent="nextPage">
                        <span aria-hidden="true">Next »</span>
                    </a>
                </li>
            </ul>
        </nav>
        <div class="section_cto pager">
            
        </div>

    </div>
</template>

<script>
  export default {
    props: ['activePage', 'totalItemsCount', 'itemsCountPerPage'],
    computed: {
      
      totalPageCount() {
        return Math.ceil(this.totalItemsCount / this.itemsCountPerPage);
      },
      next() {
        return this.activePage !== this.totalPageCount && this.totalPageCount !== 0;
      },
      previous() {
        return this.activePage !== 1;
      },
    },
    methods: {
      getPage(page) {
        this.$emit('changePage', page);
      },
      nextPage() {
        // alert(this.totalPageCount);
        const newPage = this.activePage + 1;
        this.getPage(newPage);
      },
      previousPage() {
        const newPage = this.activePage - 1;
        this.getPage(newPage);
      },
    },
  };
</script>
