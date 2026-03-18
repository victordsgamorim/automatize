import { describe, it, expect } from 'vitest';
import { createLocalLoader } from '../src/loaders/LocalLoader';

describe('createLocalLoader', () => {
  it('loads en/common translations', async () => {
    const loader = createLocalLoader();
    const result = await loader.load('en', 'common');

    expect(Object.keys(result).length).toBeGreaterThanOrEqual(5);
    expect(result['app.title']).toBe('Automatize');
    expect(result['app.loading']).toBe('Loading...');
    expect(result['app.save']).toBe('Save');
    expect(result['nav.invoices']).toBe('Invoices');
  });

  it('loads pt-BR/common translations', async () => {
    const loader = createLocalLoader();
    const result = await loader.load('pt-BR', 'common');

    expect(Object.keys(result).length).toBeGreaterThanOrEqual(5);
    expect(result['app.title']).toBe('Automatize');
    expect(result['app.loading']).toBe('Carregando...');
    expect(result['app.save']).toBe('Salvar');
    expect(result['nav.invoices']).toBe('Faturas');
  });

  it('pt-BR has the same keys as en', async () => {
    const loader = createLocalLoader();
    const en = await loader.load('en', 'common');
    const ptBR = await loader.load('pt-BR', 'common');

    expect(Object.keys(ptBR).sort()).toEqual(Object.keys(en).sort());
  });

  it('returns empty object for unsupported language', async () => {
    const loader = createLocalLoader();
    // @ts-expect-error testing unsupported language — contract: returns {} instead of throwing
    const result = await loader.load('fr', 'common');

    expect(result).toEqual({});
  });

  it('each call returns a fresh loader instance', async () => {
    const loader1 = createLocalLoader();
    const loader2 = createLocalLoader();
    const result1 = await loader1.load('en', 'common');
    const result2 = await loader2.load('en', 'common');

    expect(result1).toEqual(result2);
  });
});
