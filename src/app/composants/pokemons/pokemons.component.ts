import { DOCUMENT } from '@angular/common';

import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';

import { Pokemon } from '../../models/pokemon';
import { PokemonService } from '../../services/pokemon.service';

type PokemonMode = 'all' | 'search' | 'type' | 'generation';

interface PokemonReference {
  name: string;
  url: string;
}

@Component({
  selector: 'app-pokemons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemons.component.html',
  styleUrl: './pokemons.component.css'
})
export class PokemonsComponent implements OnInit {

  private pokemonService = inject(PokemonService);

  private document = inject(DOCUMENT);

  pokemons: Pokemon[] = [];
  selectedPokemon: Pokemon | null = null;
  nbPokemon = 0;

  loading = false;
  error = '';

  searchQuery = '';
  isSearching = false;

  currentPage = 1;
  pageSize = 20;

  types: { name: string; url: string }[] = [];
  selectedType = '';
  selectedGeneration = '';

  mode: PokemonMode = 'all';

  // Liste des Pokémon correspondant au filtre actif
  filteredPokemonReferences: PokemonReference[] = [];

  // Évite qu'une ancienne réponse API remplace les nouveaux résultats
  private requestId = 0;

  ngOnInit(): void {
    this.getPokemons();
    this.loadTypes();
  }

  getPokemons(): void {
    this.mode = 'all';
    this.isSearching = false;
    this.loadCurrentPage();
  }

  loadCurrentPage(): void {
    const currentRequest = ++this.requestId;

    this.loading = true;
    this.error = '';
    this.pokemons = [];

    const offset = (this.currentPage - 1) * this.pageSize;

    if (this.mode === 'all') {
      this.pokemonService
        .getAllPokemons(this.pageSize, offset)
        .pipe(
          switchMap(response => {
            this.nbPokemon = response.count;

            return this.loadPokemonDetails(response.results);
          })
        )
        .subscribe({
          next: details => {
            if (currentRequest !== this.requestId) return;

            this.pokemons = details;
            this.loading = false;
          },
          error: () => {
            if (currentRequest !== this.requestId) return;

            this.error = 'Impossible de charger les Pokémon.';
            this.loading = false;
          }
        });

      return;
    }

    if (this.mode === 'type' || this.mode === 'generation') {
      const pageReferences = this.filteredPokemonReferences.slice(
        offset,
        offset + this.pageSize
      );

      this.nbPokemon = this.filteredPokemonReferences.length;

      this.loadPokemonDetails(pageReferences).subscribe({
        next: details => {
          if (currentRequest !== this.requestId) return;

          this.pokemons = details;
          this.loading = false;
        },
        error: () => {
          if (currentRequest !== this.requestId) return;

          this.error = 'Impossible de charger cette page de Pokémon.';
          this.loading = false;
        }
      });
    }
  }

  translateGeneration(generation: string): string {
    const translations: Record<string, string> = {
      'generation-i': 'Génération I',
      'generation-ii': 'Génération II',
      'generation-iii': 'Génération III',
      'generation-iv': 'Génération IV',
      'generation-v': 'Génération V',
      'generation-vi': 'Génération VI',
      'generation-vii': 'Génération VII',
      'generation-viii': 'Génération VIII',
      'generation-ix': 'Génération IX'
    };

    return translations[generation] ?? generation;
  }

  private loadPokemonDetails(
    references: PokemonReference[]
  ): Observable<Pokemon[]> {

    if (references.length === 0) {
      return of([]);
    }

    // Certaines espèces ont un nom différent de leur forme Pokémon.
    // Une fiche introuvable ne bloque pas toute la page.
    const requests = references.map(reference =>
      this.pokemonService.getPokemonDetail(reference.url).pipe(
        catchError(() => of(null))
      )
    );

    return forkJoin(requests).pipe(
      map(results =>
        results.filter((pokemon): pokemon is Pokemon => pokemon !== null)
      )
    );
  }

  searchPokemon(): void {
    const name = this.searchQuery.trim().toLowerCase();

    if (!name || this.loading) {
      return;
    }

    const currentRequest = ++this.requestId;

    this.mode = 'search';
    this.isSearching = true;
    this.selectedType = '';
    this.selectedGeneration = '';

    this.loading = true;
    this.error = '';
    this.pokemons = [];

    this.pokemonService.getPokemonByName(name).subscribe({
      next: pokemon => {
        if (currentRequest !== this.requestId) return;

        this.pokemons = [pokemon];
        this.nbPokemon = 1;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        if (currentRequest !== this.requestId) return;

        this.error = err.status === 404
          ? `Aucun Pokémon trouvé pour « ${name} ».`
          : 'Erreur lors de la recherche du Pokémon.';

        this.loading = false;
      }
    });
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.selectedType = '';
    this.selectedGeneration = '';

    this.filteredPokemonReferences = [];
    this.currentPage = 1;

    this.getPokemons();
  }

  nextPage(): void {
    if (
      !this.loading &&
      this.mode !== 'search' &&
      this.currentPage * this.pageSize < this.nbPokemon
    ) {
      this.currentPage++;
      this.loadCurrentPage();
    }
  }

  previousPage(): void {
    if (
      !this.loading &&
      this.mode !== 'search' &&
      this.currentPage > 1
    ) {
      this.currentPage--;
      this.loadCurrentPage();
    }
  }

  loadTypes(): void {
    this.pokemonService.getAllTypes().subscribe({
      next: response => {
        this.types = response.results.filter(
          type => type.name !== 'unknown' && type.name !== 'stellar'
        );
      },
      error: () => {
        console.error('Impossible de charger les types Pokémon.');
      }
    });
  }

  filterByType(): void {
    if (!this.selectedType) {
      this.resetSearch();
      return;
    }

    const currentRequest = ++this.requestId;

    this.mode = 'type';
    this.isSearching = true;

    this.searchQuery = '';
    this.selectedGeneration = '';
    this.currentPage = 1;

    this.loading = true;
    this.error = '';
    this.pokemons = [];

    this.pokemonService.getPokemonsByType(this.selectedType).subscribe({
      next: response => {
        if (currentRequest !== this.requestId) return;

        this.filteredPokemonReferences = response.pokemon.map(
          item => item.pokemon
        );

        this.loadCurrentPage();
      },
      error: () => {
        if (currentRequest !== this.requestId) return;

        this.error = 'Impossible de filtrer les Pokémon par type.';
        this.loading = false;
      }
    });
  }

  filterByGeneration(generationName: string): void {
    const currentRequest = ++this.requestId;

    this.mode = 'generation';
    this.isSearching = true;

    this.selectedGeneration = generationName;
    this.selectedType = '';
    this.searchQuery = '';
    this.currentPage = 1;

    this.loading = true;
    this.error = '';
    this.pokemons = [];

    this.pokemonService.getPokemonsByGeneration(generationName).subscribe({
      next: response => {
        if (currentRequest !== this.requestId) return;

        // Trier par numéro dans le Pokédex
        const species = [...response.pokemon_species].sort((a, b) => {
          const getId = (url: string): number => {
            const match = url.match(/\/(\d+)\/?$/);
            return match ? Number(match[1]) : 0;
          };

          return getId(a.url) - getId(b.url);
        });

        // Les URL d'espèces ne sont pas des URL de fiches Pokémon.
        // On utilise le nom pour demander la forme principale.
        this.filteredPokemonReferences = species.map(item => ({
          name: item.name,
          url: `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(item.name)}`
        }));

        this.loadCurrentPage();
      },
      error: () => {
        if (currentRequest !== this.requestId) return;

        this.error = 'Impossible de charger cette génération.';
        this.loading = false;
      }
    });
  }


  openPokemonDetails(pokemon: Pokemon): void {
    this.selectedPokemon = pokemon;
    this.document.body.style.overflow = 'hidden';
  }

  closePokemonDetails(): void {
    this.selectedPokemon = null;
    this.document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.selectedPokemon) {
      this.closePokemonDetails();
    }
  }


  readonly typeTranslations: Record<string, string> = {
    normal: 'Normal',
    fire: 'Feu',
    water: 'Eau',
    electric: 'Électrik',
    grass: 'Plante',
    ice: 'Glace',
    fighting: 'Combat',
    poison: 'Poison',
    ground: 'Sol',
    flying: 'Vol',
    psychic: 'Psy',
    bug: 'Insecte',
    rock: 'Roche',
    ghost: 'Spectre',
    dragon: 'Dragon',
    dark: 'Ténèbres',
    steel: 'Acier',
    fairy: 'Fée'
  };

  readonly statTranslations: Record<string, string> = {
    hp: 'PV',
    attack: 'Attaque',
    defense: 'Défense',
    'special-attack': 'Attaque Spé.',
    'special-defense': 'Défense Spé.',
    speed: 'Vitesse'
  };

  translateType(type: string): string {
    return this.typeTranslations[type] ?? type;
  }

  translateStat(stat: string): string {
    return this.statTranslations[stat] ?? stat;
  }

  getPokemonImage(pokemon: Pokemon): string {
    return (
      pokemon.sprites.other?.['official-artwork']?.front_default ??
      pokemon.sprites.front_default ??
      ''
    );
  }
}
