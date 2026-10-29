// lib/semantic-search.ts
interface TFCDocument {
  id: number
  titre: string
  resume: string
  mots_cles: string[]
  auteur: string
  promoteur: string
  faculte_nom: string
  departement_nom: string
  filiere_nom: string
  annee: string
}

class SemanticSearchEngine {
  private documents: TFCDocument[] = []
  private vocabulary: Set<string> = new Set()
  private idf: Map<string, number> = new Map()
  private documentVectors: Map<number, number[]> = new Map()
  private isInitialized = false

  async initialize(documents: TFCDocument[]) {
    this.documents = documents
    this.buildVocabulary()
    this.calculateIDF()
    this.buildDocumentVectors()
    this.isInitialized = true
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
  }

  private buildVocabulary() {
    this.vocabulary = new Set()
    
    this.documents.forEach(doc => {
      const titleTokens = this.tokenize(doc.titre)
      const resumeTokens = this.tokenize(doc.resume)
      const keywordsTokens = doc.mots_cles.join(' ').toLowerCase().split(/\s+/)
      
      ;[...titleTokens, ...resumeTokens, ...keywordsTokens].forEach(token => {
        this.vocabulary.add(token)
      })
    })
  }

  private calculateIDF() {
    this.idf = new Map()
    const N = this.documents.length

    this.vocabulary.forEach(term => {
      let docCount = 0
      
      this.documents.forEach(doc => {
        const content = `${doc.titre} ${doc.resume} ${doc.mots_cles.join(' ')}`.toLowerCase()
        if (content.includes(term)) {
          docCount++
        }
      })

      this.idf.set(term, Math.log((N + 1) / (docCount + 1)) + 1)
    })
  }

  private calculateTF(term: string, document: TFCDocument): number {
    const content = `${document.titre} ${document.resume} ${document.mots_cles.join(' ')}`.toLowerCase()
    const tokens = this.tokenize(content)
    const termCount = tokens.filter(token => token === term).length
    return termCount / tokens.length
  }

  private buildDocumentVectors() {
    this.documentVectors = new Map()
    const vocabularyArray = Array.from(this.vocabulary)

    this.documents.forEach(doc => {
      const vector: number[] = []
      
      vocabularyArray.forEach(term => {
        const tf = this.calculateTF(term, doc)
        const idf = this.idf.get(term) || 0
        vector.push(tf * idf)
      })

      // Normaliser le vecteur
      const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
      const normalizedVector = norm > 0 ? vector.map(val => val / norm) : vector
      
      this.documentVectors.set(doc.id, normalizedVector)
    })
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i]
      normA += vecA[i] * vecA[i]
      normB += vecB[i] * vecB[i]
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  search(query: string, limit: number = 10, threshold: number = 0.3): TFCDocument[] {
    if (!this.isInitialized) {
      throw new Error('Search engine not initialized')
    }

    // Construire le vecteur de requête
    const queryTokens = this.tokenize(query)
    const vocabularyArray = Array.from(this.vocabulary)
    const queryVector: number[] = new Array(vocabularyArray.length).fill(0)

    // Calculer TF pour la requête (fréquence des termes)
    queryTokens.forEach(token => {
      const index = vocabularyArray.indexOf(token)
      if (index !== -1) {
        queryVector[index] += 1 / queryTokens.length
      }
    })

    // Appliquer IDF
    vocabularyArray.forEach((term, index) => {
      const idf = this.idf.get(term) || 0
      queryVector[index] *= idf
    })

    // Normaliser le vecteur de requête
    const norm = Math.sqrt(queryVector.reduce((sum, val) => sum + val * val, 0))
    const normalizedQueryVector = norm > 0 ? queryVector.map(val => val / norm) : queryVector

    // Calculer les similarités
    const results = this.documents.map(doc => {
      const docVector = this.documentVectors.get(doc.id) || []
      const similarity = this.cosineSimilarity(normalizedQueryVector, docVector)
      
      return {
        ...doc,
        similarity: isNaN(similarity) ? 0 : similarity
      }
    })

    // Filtrer et trier
    return results
      .filter(result => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
  }
}

export const searchEngine = new SemanticSearchEngine()