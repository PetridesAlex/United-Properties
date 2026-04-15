import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import './ServiceCard.css'

function ServiceCard({ service, id }) {
  const Icon = service.icon

  return (
    <motion.article
      id={id}
      className="service-card card-luxury"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
    >
      <span className="service-card__icon" aria-hidden="true">
        <Icon size={20} />
      </span>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <Link to="/contact" className="service-card__cta">
        Learn More <ArrowUpRight size={16} />
      </Link>
    </motion.article>
  )
}

export default ServiceCard
