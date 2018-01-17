/* global window, event, gViz, d3 */
import { computed } from '@ember/object';
import Component from '@ember/component';
import $ from 'jquery';

export default Component.extend({
  // Attrs
  data: [],
  offsetTop: null,
  resultsOffsetTop: null,
  hSize: 100,
  cHeight: computed('offsetTop','hSize', function(){ return this.get('hSize') - this.get('offsetTop') - 40; }),
  cResultsHeight: computed('resultsOffsetTop','hSize', function(){ return this.get('hSize') - this.get('resultsOffsetTop') - 50; }),

  // Sort Attrs
  cSortOrder: computed('sortOrder', function() { return this.get('sortOrder') == null ? 'ascending' : this.get('sortOrder'); }),
  cSortBy: computed('sortBy', function() { return this.get('sortBy') == null ? [] : ((typeof this.get('sortBy') === 'string' || this.get('sortBy') instanceof String) ? [this.get('sortBy')] : this.get('sortBy')); }),

  // Search attrs
  cSearch: computed('search', function() { return this.get('search') == null ? '' : this.get('search'); }),
  searchIndex: 0,
  isEmpty: computed('filteredData', function() { return this.get('filteredData').length === 0; }),

  // Filter function
  filteredData: computed('searchIndex','data', function() {

    // Initialize variables
    let component = this;
    let data = this.get('data');
    let search = this.get('cSearch').latinize().toLowerCase();

    // Filter data
    data = data.filter( a => { return search.length < 1 || (Object.keys(a).filter( key => a[key].toString().latinize().toLowerCase().indexOf(search) >= 0).length > 0);} );

    // Sort data
    data = data.sort(function(a,b) {
      let flag = false;
      component.get('cSortBy').forEach( s => flag = flag || d3[component.get('cSortOrder')](a[s], b[s]));
      return flag;
    });

    return data;
  }),

  didRender() {
    // Set offsetTop and Window Height
    this.set('offsetTop', $(`.gViz-wrapper[data-id='${this.get('_id')}']`).offset().top);
    this.set('hSize', $(window).outerHeight());
    this.set('resultsOffsetTop', $(`.gViz-wrapper[data-id='${this.get('_id')}'] .search-tool-results`).offset().top);
  },

  didInsertElement() {

    // Initialize variables
    let component = this;
    let dataUrl = this.get('dataUrl');

    // Get data from API
    gViz.helpers.loading.show();
    $.get(dataUrl, function(data) {
      component.set('data', data);
    }, "json")
    .fail(function() { gViz.helpers.loading.hide(); console.log("Error"); })
    .done(function() { gViz.helpers.loading.hide(); });
  },

  actions: {

    // Update search field
    updateSearch: function() {
      this.set('search', this.$("input.search-tool-input").val());
      if (event.keyCode === 13) { this.incrementProperty('searchIndex'); }
    },

    // Submit search field
    submitSearch: function() {
      this.incrementProperty('searchIndex');
    }

  }
});