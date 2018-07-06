<template>
    <div>
        <!-- Total page count {{totalPageCount}}<hr>
        Active Page {{activePage}}<hr>
        Total Items Count {{totalItemsCount}}<hr>
        Items Count Per Page {{itemsCountPerPage}} -->
        <nav aria-label="pagination" class="pull-right">
            <ul class="pagination pagination-sm">
                <li class="disabled">
                <a href="#" aria-label="Previous">
                    <span aria-hidden="true">« Previous</span>
                </a>
                </li>
                <li class="active">
                    <a href="#">20
                        <span class="sr-only">(current)</span>
                    </a>
                </li>
                <li v-for="page in totalPageCount" :key="page" v-bind:class="{ active: activePage == page }">
                    <a href="#" @click.prevent="getPage(page)">{{page}}</a>
                </li>
                
                <li>
                <a href="#" aria-label="Next">
                    <span aria-hidden="true">Next »</span>
                </a>
                </li>
            </ul>
        </nav>
        <div class="section_cto pager">
            <nav class="pager_nav">
                <div class="pager_item hidden prev" v-if="previous">
                    <a href="#" @click.prevent="previousPage">Previous <i class="fa fa-caret-left"></i></a>
                </div>
                <div class="pager_item" v-for="page in totalPageCount"
                :key="page" v-bind:class="{ active: activePage == page }">
                    <a href="#" @click.prevent="getPage(page)">{{page}}</a>
                </div>
                <div class="pager_item next" v-if="next">
                    <a href="#" @click.prevent="nextPage"> <i class="fa fa-caret-right"></i> Next</a>
                </div>
            </nav>

        </div>

    </div>
</template>

<script>
  export default {
    props: ['activePage', 'totalItemsCount', 'itemsCountPerPage'],
    computed: {
      next() {
        return this.activePage !== this.totalPageCount;
      },
      previous() {
        return this.activePage !== 1;
      },
      totalPageCount() {
        return Math.ceil(this.totalItemsCount / this.itemsCountPerPage);
      },
    },
    methods: {
      getPage(page) {
        this.$emit('changePage', page);
      },
      nextPage() {
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
