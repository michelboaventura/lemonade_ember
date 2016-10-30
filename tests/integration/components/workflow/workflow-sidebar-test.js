import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('workflow/workflow-sidebar', 'Integration | Component | workflow/workflow sidebar', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{workflow/workflow-sidebar}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#workflow/workflow-sidebar}}
      template block text
    {{/workflow/workflow-sidebar}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});