"""
SEAI Grants Service
Provides structured information about available solar grants in Ireland
"""
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class Grant:
    """Represents a single grant scheme"""
    def __init__(
        self,
        id: str,
        name: str,
        amount: float,
        description: str,
        eligibility: List[str],
        application_process: str,
        valid_from: str,
        valid_until: Optional[str] = None,
        conditions: Optional[List[str]] = None,
        url: Optional[str] = None
    ):
        self.id = id
        self.name = name
        self.amount = amount
        self.description = description
        self.eligibility = eligibility
        self.application_process = application_process
        self.valid_from = valid_from
        self.valid_until = valid_until
        self.conditions = conditions or []
        self.url = url
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "amount": self.amount,
            "description": self.description,
            "eligibility": self.eligibility,
            "application_process": self.application_process,
            "valid_from": self.valid_from,
            "valid_until": self.valid_until,
            "conditions": self.conditions,
            "url": self.url
        }


class GrantsService:
    """Service for managing and retrieving SEAI grant information"""
    
    def __init__(self):
        # In a production system, this would come from a database or external API
        self.grants = self._initialize_grants()
        logger.info(f"GrantsService initialized with {len(self.grants)} grants")
    
    def _initialize_grants(self) -> List[Grant]:
        """
        Initialize grant data.
        Updated with 2025 grant amounts from SEAI.
        """
        return [
            Grant(
                id="seai_solar_pv_residential",
                name="SEAI Solar PV Grant - Residential (2025)",
                amount=1800.0,  # Maximum amount - actual varies by system size
                description="Tiered grant for residential solar PV: €700/kWp up to 2kWp, then €200/kWp up to 4kWp (max €1,800)",
                eligibility=[
                    "Owner-occupied dwelling built and occupied before 31 December 2020",
                    "Post-works Building Energy Rating (BER) certificate required",
                    "Installation by SEAI registered contractor",
                    "Must be connected to the electricity grid",
                    "No previous SEAI solar PV funding at this MPRN"
                ],
                application_process="Application submitted by SEAI registered installer on your behalf",
                valid_from="2025-01-01",
                valid_until=None,  # Ongoing scheme
                conditions=[
                    "Grant paid to homeowner after completion and BER assessment",
                    "Cannot be combined with previous SEAI solar grants at same address",
                    "Post-works BER must be completed before grant payment",
                    "Must receive grant approval before installation begins",
                    "8 months to complete works after approval"
                ],
                url="https://www.seai.ie/grants/home-energy-grants/solar-electricity-grant/"
            ),

            Grant(
                id="clean_export_guarantee",
                name="Clean Export Guarantee (CEG)",
                amount=0.0,  # Variable rate
                description="Get paid for excess solar electricity exported to the grid",
                eligibility=[
                    "Solar PV system installed",
                    "Electricity supplier participating in CEG scheme",
                    "Export meter installed"
                ],
                application_process="Register with your electricity supplier",
                valid_from="2022-08-01",
                valid_until=None,
                conditions=[
                    "Payment rate varies by supplier (typically €0.185-€0.24 per kWh)",
                    "Requires smart meter or export meter",
                    "Not a grant - ongoing payment for exported electricity"
                ],
                url="https://www.seai.ie/business-and-public-sector/clean-export-guarantee/"
            )
        ]
    
    def calculate_solar_pv_grant(self, system_capacity_kwp: float) -> float:
        """
        Calculate the actual SEAI Solar PV grant amount based on system size (2025 rates).
        
        Rates:
        - €700 per kWp up to 2kWp
        - €200 per additional kWp from 2kWp to 4kWp
        - Maximum grant: €1,800
        
        Args:
            system_capacity_kwp: System capacity in kWp
            
        Returns:
            Grant amount in euros
            
        Examples:
            1.5 kWp -> €1,050 (1.5 * €700)
            2.0 kWp -> €1,400 (2.0 * €700)
            3.0 kWp -> €1,600 (2.0 * €700 + 1.0 * €200)
            4.0 kWp -> €1,800 (2.0 * €700 + 2.0 * €200)
            5.0 kWp -> €1,800 (capped at maximum)
        """
        if system_capacity_kwp <= 0:
            return 0.0
        
        grant_amount = 0.0
        
        # First 2 kWp at €700 per kWp
        if system_capacity_kwp <= 2.0:
            grant_amount = system_capacity_kwp * 700
        else:
            # First 2 kWp
            grant_amount = 2.0 * 700
            
            # Additional capacity from 2kWp to 4kWp at €200 per kWp
            additional_capacity = min(system_capacity_kwp - 2.0, 2.0)
            grant_amount += additional_capacity * 200
        
        # Cap at maximum of €1,800
        return min(grant_amount, 1800.0)
    
    def get_all_grants(self) -> List[Dict[str, Any]]:
        """Get all available grants"""
        return [grant.to_dict() for grant in self.grants]
    
    def get_applicable_grants(
        self,
        system_capacity_kwp: Optional[float] = None,
        has_battery: bool = False,
        property_type: str = "residential"
    ) -> Dict[str, Any]:
        """
        Get grants applicable to a specific situation with accurate 2025 calculations.
        
        Args:
            system_capacity_kwp: Solar system capacity in kWp
            has_battery: Whether installation includes battery storage
            property_type: Type of property (residential, commercial)
            
        Returns:
            Dictionary with applicable grants and total potential savings
        """
        applicable = []
        total_grant_amount = 0.0
        
        for grant in self.grants:
            # Filter based on criteria
            if property_type == "residential":
                if grant.id == "seai_solar_pv_residential":
                    grant_dict = grant.to_dict()
                    # Calculate actual grant amount based on system size
                    if system_capacity_kwp:
                        actual_grant = self.calculate_solar_pv_grant(system_capacity_kwp)
                        grant_dict["actual_amount"] = actual_grant
                        grant_dict["amount_note"] = f"Calculated for {system_capacity_kwp:.1f} kWp system"
                        total_grant_amount += actual_grant
                    else:
                        # No system size provided, show maximum
                        grant_dict["actual_amount"] = grant.amount
                        grant_dict["amount_note"] = "Maximum amount (4kWp+ system)"
                        total_grant_amount += grant.amount
                    
                    applicable.append(grant_dict)
                
                if grant.id == "clean_export_guarantee":
                    applicable.append(grant.to_dict())
        
        return {
            "grants": applicable,
            "total_grant_amount": round(total_grant_amount, 2),
            "estimated_first_year_savings": round(total_grant_amount, 2),
            "recommendations": self._generate_recommendations(applicable, system_capacity_kwp)
        }
    
    def _generate_recommendations(self, applicable_grants: List[Dict], system_capacity_kwp: Optional[float] = None) -> List[str]:
        """Generate recommendations based on applicable grants"""
        recommendations = []
        
        grant_ids = [g["id"] for g in applicable_grants]
        
        if "seai_solar_pv_residential" in grant_ids:
            recommendations.append(
                "Apply for the SEAI Solar PV Grant through your SEAI registered installer"
            )
            
            # Add system size optimization tip
            if system_capacity_kwp:
                if system_capacity_kwp < 2.0:
                    recommendations.append(
                        f"Your {system_capacity_kwp:.1f} kWp system qualifies for €{self.calculate_solar_pv_grant(system_capacity_kwp):,.0f}. "
                        f"Systems up to 2kWp receive €700/kWp."
                    )
                elif system_capacity_kwp < 4.0:
                    recommendations.append(
                        f"Your {system_capacity_kwp:.1f} kWp system qualifies for €{self.calculate_solar_pv_grant(system_capacity_kwp):,.0f}. "
                        f"Maximum grant of €1,800 reached at 4kWp."
                    )
                else:
                    recommendations.append(
                        f"Your {system_capacity_kwp:.1f} kWp system qualifies for the maximum grant of €1,800."
                    )
        
        if "clean_export_guarantee" in grant_ids:
            recommendations.append(
                "Register for the Clean Export Guarantee to earn €0.185-€0.24 per kWh exported"
            )
        
        recommendations.append(
            "Complete a post-works BER assessment before receiving grant payment"
        )
        
        recommendations.append(
            "Your home must be built and occupied before 31 December 2020 to qualify"
        )
        
        return recommendations
    
    def search_grants(self, query: str) -> List[Dict[str, Any]]:
        """
        Search grants by keyword
        
        Args:
            query: Search term
            
        Returns:
            List of matching grants
        """
        query_lower = query.lower()
        matching_grants = []
        
        for grant in self.grants:
            if (query_lower in grant.name.lower() or
                query_lower in grant.description.lower() or
                any(query_lower in e.lower() for e in grant.eligibility)):
                matching_grants.append(grant.to_dict())
        
        return matching_grants
    
    def format_grants_for_chatbot(self, grants_data: Dict[str, Any]) -> str:
        """
        Format grant information for chatbot response
        
        Args:
            grants_data: Output from get_applicable_grants()
            
        Returns:
            Formatted string for chatbot
        """
        if not grants_data.get("grants"):
            return "No applicable grants found for this configuration."
        
        output = []
        output.append(f"**Available Grants (Total: €{grants_data['total_grant_amount']:,.0f}):**\n")
        
        for grant in grants_data["grants"]:
            output.append(f"**{grant['name']}**")
            if grant['amount'] > 0:
                output.append(f"- Amount: €{grant['amount']:,.0f}")
            output.append(f"- {grant['description']}")
            output.append("")
        
        if grants_data.get("recommendations"):
            output.append("**Recommendations:**")
            for rec in grants_data["recommendations"]:
                output.append(f"- {rec}")
        
        return "\n".join(output)


# Global instance
grants_service = GrantsService()
