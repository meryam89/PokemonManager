
import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { GenerationsComponent } from './composants/generations/generations.component';
import { PokemonsComponent } from './composants/pokemons/pokemons.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GenerationsComponent, PokemonsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  title = 'PokemonManager';

  @ViewChild(PokemonsComponent)
  pokemonsComponent?: PokemonsComponent;

  onGenerationSelected(generationName: string): void {
    this.pokemonsComponent?.filterByGeneration(generationName);
  }
}

