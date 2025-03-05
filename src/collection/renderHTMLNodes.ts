import cytoscape from "cytoscape";

interface HTMLLabelOptions {
  hideOriginal?: boolean;
  nodeClass?: string;
  width?: number;
  height?: number;
}

export default function renderHTML(options: HTMLLabelOptions = { 
  hideOriginal: true,
  nodeClass: 'cy-node-html',
  width: 40,
  height: 40
}) {
  const cy = this.cy();
  const container = cy.container();
  const labelContainer = document.createElement('div');
  const containerId = '__cytoscape-html-labels__';

  // Initialize container
  if (!document.getElementById(containerId)) {
    labelContainer.id = containerId;
    labelContainer.style.position = 'absolute';
    labelContainer.style.left = '0';
    labelContainer.style.top = '0';
    labelContainer.style.width = '100%';
    labelContainer.style.height = '100%';
    labelContainer.style.overflow = 'hidden';
    labelContainer.style.zIndex = '10';
    container.appendChild(labelContainer);
  }

  const updateNode = (node: cytoscape.NodeSingular) => {
    const id = node.id();
    const html = node.data('html');
    if (!html) return;

    const labelId = `__cy_label_${id}`;
    let labelDiv = document.getElementById(labelId);

    if (!labelDiv) {
      labelDiv = document.createElement('div');
      labelDiv.id = labelId;
      labelDiv.className = options.nodeClass;
      labelDiv.style.position = 'absolute';
      labelDiv.style.transformOrigin = 'center';
      labelDiv.style.width = `${options.width}px`;
      labelDiv.style.height = `${options.height}px`;
      labelDiv.style.display = 'flex';
      labelDiv.style.alignItems = 'center';
      labelDiv.style.justifyContent = 'center';
      labelDiv.style.cursor = 'pointer';
      labelContainer.appendChild(labelDiv);

      // Make the div interactive
      labelDiv.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        node.trigger('mousedown');
      });
      
      labelDiv.addEventListener('mouseover', () => node.trigger('mouseover'));
      labelDiv.addEventListener('mouseout', () => node.trigger('mouseout'));
    }

    const pos = node.renderedPosition();
    const zoom = cy.zoom();
    
    labelDiv.innerHTML = html;
    labelDiv.style.transform = `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) scale(${zoom})`;

    if (options.hideOriginal) {
      node.style({
        'width': options.width,
        'height': options.height,
        'background-opacity': 0.15,  // Keep a slight background for better interaction
        'border-width': 1,
        'border-opacity': 0.2,
        'label': ''
      });
    }
  };

  // Event handlers
  const updateAll = () => this.forEach(updateNode);
  const removeNode = (node: cytoscape.NodeSingular) => {
    const labelDiv = document.getElementById(`__cy_label_${node.id()}`);
    if (labelDiv) labelContainer.removeChild(labelDiv);
  };

  // Register events
  cy.on('add', 'node', e => updateNode(e.target));
  cy.on('remove', 'node', e => removeNode(e.target));
  cy.on('position', 'node', e => updateNode(e.target));
  cy.on('pan zoom resize', updateAll);
  cy.on('drag', 'node', e => updateNode(e.target));

  // Initial render
  updateAll();

  return this;
}
