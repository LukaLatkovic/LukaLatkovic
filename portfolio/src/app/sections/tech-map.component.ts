import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

type Tile = {
  key: 'backend' | 'frontend' | 'data' | 'delivery';
  icon: string;
  titleKey: string;
  itemsKey: string;
  anchor: string;
};

@Component({
  selector: 'section-tech-map',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './tech-map.component.html',
})
export class TechMapSection {
  tiles: Tile[] = [
    { key: 'backend', icon: '⚙️', titleKey: 'tm_backend', itemsKey: 'tm_backend_items', anchor: '#experience' },
    { key: 'frontend', icon: '🧩', titleKey: 'tm_frontend', itemsKey: 'tm_frontend_items', anchor: '#skills' },
    { key: 'data', icon: '📊', titleKey: 'tm_data', itemsKey: 'tm_data_items', anchor: '#experience' },
    { key: 'delivery', icon: '🚀', titleKey: 'tm_delivery', itemsKey: 'tm_delivery_items', anchor: '#contact' },
  ];
}