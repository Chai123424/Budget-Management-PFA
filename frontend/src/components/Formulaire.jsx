"use client"

import "../css/Formulaire.css"

export default function Formulaire() {
  return (
    <div className="form-container">
      <header className="header">
        <img src="/placeholder.svg" alt="Budget Logo" />
      </header>

      <div className="form-content">
        <h1 className="main-title">FORMULAIRE DE BUDGET</h1>
        <h2 className="section-title">Informations personnelles</h2>

        <div className="form-group">
          <div className="form-row">
            <label htmlFor="nom">Nom</label>
            <input type="text" id="nom" name="nom" />
          </div>
          <div className="form-row right">
            <label htmlFor="prenom">Prénom</label>
            <input type="text" id="prenom" name="prenom" />
          </div>
        </div>

        <div className="form-group">
          <div className="form-row">
            <label htmlFor="age">Âge</label>
            <input type="text" id="age" name="age" />
          </div>
          <div className="form-row right">
            <label htmlFor="email">Email</label>
            <input type="text" id="email" name="email" />
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="universite">Université</label>
          <select id="universite" name="universite">
            <option value="">--Sélectionner--</option>
            <option value="paris">Université de Paris</option>
            <option value="lyon">Université de Lyon</option>
            <option value="marseille">Université de Marseille</option>
            <option value="bordeaux">Université de Bordeaux</option>
          </select>
        </div>

        <h2 className="section-title">Informations budgétaires</h2>

        <div className="form-row">
          <label htmlFor="budget">Budget mensuel (€)</label>
          <input type="text" id="budget" name="budget" />
        </div>

        <div className="form-row">
          <label>Avez-vous un emploi?</label>
          <div className="radio-group">
            <input type="radio" id="emploi-oui" name="emploi" value="oui" />
            <label htmlFor="emploi-oui" className="radio-label">
              Oui
            </label>
            <input type="radio" id="emploi-non" name="emploi" value="non" defaultChecked />
            <label htmlFor="emploi-non" className="radio-label">
              Non
            </label>
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="loyer">Loyer mensuel (€)</label>
          <input type="text" id="loyer" name="loyer" />
        </div>
      </div>
    </div>
  )
}
