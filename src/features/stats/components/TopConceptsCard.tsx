import type { ConceptTotal } from '../../../services/stats'
import { formatMoney } from '../../../utils/format'

export function TopConceptsCard({ concepts }: { concepts: ConceptTotal[] }) {
  if (!concepts.length) return null

  return (
    <div className="card">
      <h3>
        En qué se va más<small>Conceptos con mayor gasto este mes</small>
      </h3>
      <table className="tbl">
        <tbody>
          {concepts.map((concept) => (
            <tr key={concept.name.toLowerCase()}>
              <td>
                <div className="name">
                  {concept.name}
                  <small className="count">×{concept.count}</small>
                </div>
              </td>
              <td>{formatMoney(concept.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
