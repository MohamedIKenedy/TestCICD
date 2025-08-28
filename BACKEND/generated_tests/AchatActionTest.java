package com.atouch.projet_jee.beans.achat;
import com.atouch.projet_jee.beans.Investisseur;
import com.atouch.projet_jee.beans.portfeuille.Portefeuille;
import com.atouch.projet_jee.beans.Societe;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity
public class AchatAction {
    @Id
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    private Investisseur investisseur;
    @ManyToOne(fetch = FetchType.LAZY)
    private Portefeuille portefeuille;*/
    private long nombre;
    @ManyToOne(fetch = FetchType.LAZY)
    private Societe societe;
    private LocalDateTime dateAchat;
    private BigDecimal montantUnitaire;
    private BigDecimal montantBase;
    private BigDecimal montantTotalAvecImpots;
    public Long getId() { /* ... */ }
}
public void setId(Long id) { /* ... */ }
}
public Investisseur getInvestisseur() { /* ... */ }
}
public void setInvestisseur(Investisseur investisseur) { /* ... */ }
}
public long getNombre() { /* ... */ }
}
public void setNombre(long nombre) { /* ... */ }
}
public Societe getSociete() { /* ... */ }
}
public void setSociete(Societe societe) { /* ... */ }
}
public LocalDateTime getDateAchat() { /* ... */ }
}
public void setDateAchat(LocalDateTime dateAchat) { /* ... */ }
}
public BigDecimal getMontantUnitaire() { /* ... */ }
}
public void setMontantUnitaire(BigDecimal montantUnitaire) { /* ... */ }
}
public BigDecimal getMontantBase() { /* ... */ }
}
public void setMontantBase(BigDecimal montantBase) { /* ... */ }
}
public BigDecimal getMontantTotalAvecImpots() { /* ... */ }
}
public void setMontantTotalAvecImpots(BigDecimal montantTotalAvecImpots) { /* ... */ }
}
}