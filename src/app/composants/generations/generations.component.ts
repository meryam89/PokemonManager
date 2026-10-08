
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PokemonService } from '../../services/pokemon.service';
import { Generation } from '../../models/generation';

@Component({
  selector: 'app-generations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generations.component.html',
  styleUrl: './generations.component.css'
})
export class GenerationsComponent implements OnInit {

  private pokemonService = inject(PokemonService);

  @Output() generationSelected = new EventEmitter<string>();

  generations: Generation[] = [];
  selectedGeneration = '';

  ngOnInit(): void {
    this.getGenerations();
  }

  getGenerations(): void {
    this.pokemonService.getAllGenerations().subscribe({
      next: (data) => {
        this.generations = data;
      },
      error: () => {
        console.error('Impossible de charger les générations.');
      }
    });
  }

  selectGeneration(name: string): void {
    this.selectedGeneration = name;
    this.generationSelected.emit(name);
  }
}
