export const materials = [
  ['light-wood','Light wood','#d4bc95',.72],['dark-wood','Dark wood','#69503b',.7],['oak','Oak','#b99362',.72],['walnut','Walnut','#77543d',.68],['marble','Marble','#e3e5e7',.3],['ceramic','Ceramic tile','#c1cbd0',.35],['concrete','Concrete','#a4a8ab',.95],['carpet','Carpet','#8995a3',1],['vinyl','Vinyl','#b9afa1',.6],['laminate','Laminate','#c9b18e',.6],['white-paint','White paint','#f1f0ea',.85],['neutral-paint','Neutral paint','#cbc6bd',.85],['brick','Brick','#a96d57',.95],['wood-panel','Wood panel','#a88561',.8],['tile','Wall tile','#d7e1df',.4],
] as const;
// Original procedural assets, dimensions in meters (width, depth, height).
export const furnitureLibrary = [
  ['sofa','Sofa','Living',2.1,.9,.85],['sectional','Sectional sofa','Living',2.8,1.7,.85],['armchair','Armchair','Living',.85,.85,.9],['coffee-table','Coffee table','Living',1.1,.6,.42],['tv-stand','TV stand','Living',1.6,.4,.5],['side-table','Side table','Living',.5,.5,.5],['bookshelf','Bookshelf','Living',.9,.35,1.8],
  ['single-bed','Single bed','Bedroom',.96,1.96,.6],['double-bed','Double bed','Bedroom',1.37,1.91,.6],['queen-bed','Queen bed','Bedroom',1.52,2.03,.6],['king-bed','King bed','Bedroom',1.93,2.03,.6],['nightstand','Nightstand','Bedroom',.5,.4,.55],['wardrobe','Wardrobe','Bedroom',1.8,.6,2.1],['dresser','Dresser','Bedroom',1.2,.45,.85],
  ['base-cabinet','Base cabinet','Kitchen',.6,.6,.9],['wall-cabinet','Wall cabinet','Kitchen',.6,.35,.7],['island','Kitchen island','Kitchen',1.8,.9,.9],['refrigerator','Refrigerator','Kitchen',.75,.7,1.8],['stove','Stove','Kitchen',.6,.6,.9],['kitchen-sink','Kitchen sink','Kitchen',.8,.6,.9],['dining-table','Dining table','Kitchen',1.6,.9,.75],['dining-chair','Dining chair','Kitchen',.48,.5,.9],
  ['toilet','Toilet','Bathroom',.4,.7,.75],['bathtub','Bathtub','Bathroom',.75,1.7,.6],['shower','Shower','Bathroom',.9,.9,2.1],['vanity','Bathroom vanity','Bathroom',.9,.5,.85],['sink','Sink','Bathroom',.55,.45,.85],
  ['desk','Desk','Office',1.4,.7,.75],['office-chair','Office chair','Office',.65,.65,1.1],['meeting-table','Meeting table','Office',2.4,1.2,.75],['storage-cabinet','Storage cabinet','Office',.9,.45,1.2],
  ['rug','Rug','Other',2,1.5,.015],['floor-lamp','Floor lamp','Other',.4,.4,1.6],['plant','Decorative plant','Other',.5,.5,1.1],['storage','Storage unit','Other',1,.4,1],
] as const;
export const doorStyles=['Single door','Double door','Sliding door','Pocket door','Front entrance','Interior door','Open passage'];
export const windowStyles=['Standard window','Double window','Picture window','Sliding window','Floor-to-ceiling'];
