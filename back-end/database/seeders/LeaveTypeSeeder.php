<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\LeaveType;

class LeaveTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $leaveTypes = [
            [
                'name' => 'Congé Payé',
                'code' => 'PAID_LEAVE',
                'description' => 'Congé rémunéré',
                'is_active' => true,
                'is_paid' => true,
                'requires_approval' => true,
                'max_days_per_year' => 25,
                'requires_medical_certificate' => false
            ],
            [
                'name' => 'Repos Compensateur',
                'code' => 'COMPENSATORY_REST',
                'description' => 'Repos accordé en compensation d\'heures supplémentaires',
                'is_active' => true,
                'is_paid' => true,
                'requires_approval' => true,
                'max_days_per_year' => null,
                'requires_medical_certificate' => false
            ],
            [
                'name' => 'Congé Sans Solde',
                'code' => 'UNPAID_LEAVE',
                'description' => 'Congé non rémunéré',
                'is_active' => true,
                'is_paid' => false,
                'requires_approval' => true,
                'max_days_per_year' => null,
                'requires_medical_certificate' => false
            ],
            [
                'name' => 'Maladie',
                'code' => 'SICK',
                'description' => 'Arrêt maladie',
                'is_active' => true,
                'is_paid' => true,
                'requires_approval' => false,
                'max_days_per_year' => null,
                'requires_medical_certificate' => true
            ],
            [
                'name' => 'Congé Maternité',
                'code' => 'MATERNITY',
                'description' => 'Congé de maternité',
                'is_active' => true,
                'is_paid' => true,
                'requires_approval' => false,
                'max_days_per_year' => null,
                'requires_medical_certificate' => true
            ],
            [
                'name' => 'Congé Paternité',
                'code' => 'PATERNITY',
                'description' => 'Congé de paternité',
                'is_active' => true,
                'is_paid' => true,
                'requires_approval' => false,
                'max_days_per_year' => null,
                'requires_medical_certificate' => false
            ],
            [
                'name' => 'Congé Enfant Malade',
                'code' => 'SICK_CHILD_LEAVE',
                'description' => 'Congé pour s\'occuper d\'un enfant malade',
                'is_active' => true,
                'is_paid' => true,
                'requires_approval' => true,
                'max_days_per_year' => null,
                'requires_medical_certificate' => true
            ],
            [
                'name' => 'Congé Enfant à charge',
                'code' => 'DEPENDENT_CHILD_LEAVE',
                'description' => 'Congé pour un enfant à charge',
                'is_active' => true,
                'is_paid' => true,
                'requires_approval' => true,
                'max_days_per_year' => null,
                'requires_medical_certificate' => false
            ],
            [
                'name' => 'Absence Exceptionnelle',
                'code' => 'EXCEPTIONAL_ABSENCE',
                'description' => 'Absence pour des événements exceptionnels',
                'is_active' => true,
                'is_paid' => false,
                'requires_approval' => true,
                'max_days_per_year' => null,
                'requires_medical_certificate' => false
            ],
            [
                'name' => 'Absence consultant externe',
                'code' => 'EXTERNAL_CONSULTANT_ABSENCE',
                'description' => 'Absence d\'un consultant externe',
                'is_active' => true,
                'is_paid' => false,
                'requires_approval' => false,
                'max_days_per_year' => null,
                'requires_medical_certificate' => false
            ],
            [
                'name' => 'Congé Formation',
                'code' => 'TRAINING_LEAVE',
                'description' => 'Congé pour formation professionnelle',
                'is_active' => true,
                'is_paid' => true,
                'requires_approval' => true,
                'max_days_per_year' => 5,
                'requires_medical_certificate' => false
            ],
            [
                'name' => 'Congé Mariage',
                'code' => 'WEDDING_LEAVE',
                'description' => 'Congé pour mariage',
                'is_active' => true,
                'is_paid' => true,
                'requires_approval' => true,
                'max_days_per_year' => 3,
                'requires_medical_certificate' => false
            ],
            [
                'name' => 'Congé Décès',
                'code' => 'BEREAVEMENT_LEAVE',
                'description' => 'Congé pour décès d\'un proche',
                'is_active' => true,
                'is_paid' => true,
                'requires_approval' => false,
                'max_days_per_year' => 5,
                'requires_medical_certificate' => false
            ],
            [
                'name' => 'Congé Parental',
                'code' => 'PARENTAL_LEAVE',
                'description' => 'Congé parental',
                'is_active' => true,
                'is_paid' => true,
                'requires_approval' => false,
                'max_days_per_year' => null,
                'requires_medical_certificate' => false
            ],
            [
                'name' => 'Congé Adoption',
                'code' => 'ADOPTION_LEAVE',
                'description' => 'Congé pour adoption',
                'is_active' => true,
                'is_paid' => true,
                'requires_approval' => false,
                'max_days_per_year' => null,
                'requires_medical_certificate' => false
            ],
            [
                'name' => 'Congé Sabbatique',
                'code' => 'SABBATICAL_LEAVE',
                'description' => 'Congé sabbatique',
                'is_active' => true,
                'is_paid' => false,
                'requires_approval' => true,
                'max_days_per_year' => null,
                'requires_medical_certificate' => false
            ]
        ];

        foreach ($leaveTypes as $leaveType) {
            LeaveType::firstOrCreate(['code' => $leaveType['code']], $leaveType);
        }
    }
}
