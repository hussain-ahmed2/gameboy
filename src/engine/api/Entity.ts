/**
 * @file Entity.ts
 * @description Simple component-based entity system.
 *   Lightweight alternative to full ECS frameworks.
 */

import type { Component } from '@/lib/types';

export class Entity {
  x: number = 0;
  y: number = 0;
  components: Component[] = [];
  tags: Set<string> = new Set();
  active: boolean = true;

  /** Add a component to this entity */
  addComponent(component: Component): this {
    this.components.push(component);
    return this;
  }

  /** Get a component by type */
  getComponent<T extends Component>(type: new () => T): T | null {
    for (const comp of this.components) {
      if (comp instanceof type) return comp as T;
    }
    return null;
  }

  /** Get all components of a type */
  getComponents<T extends Component>(type: new () => T): T[] {
    return this.components.filter((c) => c instanceof type) as T[];
  }

  /** Check if entity has a tag */
  hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  /** Add a tag */
  addTag(tag: string): this {
    this.tags.add(tag);
    return this;
  }

  /** Remove a tag */
  removeTag(tag: string): this {
    this.tags.delete(tag);
    return this;
  }

  /** Update all components */
  update(deltaTime: number): void {
    if (!this.active) return;
    for (const component of this.components) {
      component.update(this, deltaTime);
    }
  }

  /** Deactivate entity */
  destroy(): void {
    this.active = false;
  }
}