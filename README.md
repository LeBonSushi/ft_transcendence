List d'Endpoint :

Auth endpoint:

                    POST   /auth/register                                    // Créer un nouveau compte
                    POST   /auth/login                                       // Connexion
                    POST   /auth/oauth                                       // OAuth login
                    GET    /auth/me                                          // Récupérer l'utilisateur connecté
                    POST   /auth/logout                                      // Déconnexion
                    DELETE /auth/account                                     // Supprimer son propre compte

Room endpoint:

                    POST   /room                                             // Créer une room
                    GET    /room/:id                                         // Récupérer les détails d'une room
                    PUT    /room/:id                                         // Modifier une room (nom, description)
                    DELETE /room/:id                                         // Supprimer une room (admin uniquement)
                    POST   /room/:id/join                                    // Rejoindre une room
                    POST   /room/:id/leave                                   // Quitter une room
                    GET    /room/:id/members                                 // Lister les membres d'une room
                    PUT    /room/:id/member/:userId/role                     // Changer le rôle d'un membre (ADMIN/MEMBER)
                    DELETE /room/:id/member/:userId                          // Kick un membre (admin uniquement)
                    PUT    /room/:id/status                                  // Changer le status (PLANNING/CONFIRMED/COMPLETED)

Room/:id/availability endpoint:

                    GET    /room/:roomId/availability                        // Lister toutes les disponibilités
                    POST   /room/:roomId/availability                        // Ajouter ses disponibilités
                    PUT    /room/:roomId/availability/:id                    // Modifier ses disponibilités
                    DELETE /room/:roomId/availability/:id                    // Supprimer ses disponibilités

Room/:id/proposal endpoint:

                    GET    /room/:roomId/proposal                            // Lister toutes les propositions
                    POST   /room/:roomId/proposal                            // Créer une proposition de voyage
                    PUT    /room/:roomId/proposal/:id                        // Modifier une proposition
                    DELETE /room/:roomId/proposal/:id                        // Supprimer une proposition
                    PUT    /room/:roomId/proposal/:id/select                 // Sélectionner une proposition (isSelected = true)

Room/:id/proposal/:id/vote endpoint:

                    POST   /room/:roomId/proposal/:proposalId/vote           // Voter pour une proposition
                    PUT    /room/:roomId/proposal/:proposalId/vote           // Modifier son vote
                    DELETE /room/:roomId/proposal/:proposalId/vote           // Supprimer son vote
                    GET    /room/:roomId/proposal/:proposalId/votes          // Voir tous les votes

Room/:id/proposal/:id/activity endpoint:

                    GET    /room/:roomId/proposal/:proposalId/activity       // Lister les activités
                    POST   /room/:roomId/proposal/:proposalId/activity       // Suggérer une activité
                    PUT    /room/:roomId/proposal/:proposalId/activity/:id   // Modifier une activité
                    DELETE /room/:roomId/proposal/:proposalId/activity/:id   // Supprimer une activité

Room/:id/message endpoint:

                    GET    /room/:roomId/message                             // Récupérer l'historique des messages
                    POST   /room/:roomId/message                             // Envoyer un message
                    DELETE /room/:roomId/message/:id                         // Supprimer son message

User endpoint:

                    GET    /user/:id                                         // Récupérer les infos d'un utilisateur
                    PUT    /user/:id/profile                                 // Mettre à jour le profil
                    PUT    /user/:id/avatar                                  // Upload/modifier l'avatar
                    GET    /user/:id/rooms                                   // Lister les rooms de l'utilisateur
                    GET    /user/:id/friends                                 // Lister les amis de l'utilisateur

Friend endpoint:

                    GET    /friend/requests                                    // Liste des demandes d'amis reçues
                    POST   /friend/request/:userId                          // Envoyer une demande d'ami
                    PUT    /friend/accept/:friendshipId                     // Accepter une demande
                    PUT    /friend/reject/:friendshipId                     // Refuser une demande
                    DELETE /friend/:friendshipId                            // Supprimer un ami
                    PUT    /friend/block/:friendshipId                      // Bloquer un utilisateur
                    PUT    /friend/unblock/:friendshipId                    // Débloquer un utilisateur